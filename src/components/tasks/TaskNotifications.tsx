'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Task } from '@/store/slices/tasksSlice';
import { AlarmNotification } from './AlarmNotification';
import { useRouter } from 'next/navigation';
import { SafeStorage, debounce } from '@/lib/utils/storage';
import { TIMING_CONFIG, STORAGE_KEYS } from '@/lib/constants/notifications';

interface TaskNotificationsProps {
  tasks: Task[];
}

interface SnoozedTask {
  task: Task;
  snoozeUntil: number;
}

/**
 * TaskNotifications component
 * Handles alarm notifications with 5-minute snooze/repeat
 * Fixed: Race conditions, localStorage issues, performance, cleanup
 */
export function TaskNotifications({ tasks }: TaskNotificationsProps) {
  const router = useRouter();
  const shownNotifications = useRef<Set<string>>(new Set());
  const dismissedNotifications = useRef<Set<string>>(new Set());
  const [activeNotification, setActiveNotification] = useState<Task | null>(null);
  const [snoozedTasks, setSnoozedTasks] = useState<SnoozedTask[]>([]);
  const browserNotificationRef = useRef<Notification | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs for values used in interval callback to avoid recreating interval
  const tasksRef = useRef<Task[]>(tasks);
  const activeNotificationRef = useRef<Task | null>(activeNotification);
  const snoozedTasksRef = useRef<SnoozedTask[]>(snoozedTasks);

  // Keep refs in sync with state
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    activeNotificationRef.current = activeNotification;
  }, [activeNotification]);

  useEffect(() => {
    snoozedTasksRef.current = snoozedTasks;
  }, [snoozedTasks]);

  // Load dismissed notifications from storage on mount
  useEffect(() => {
    try {
      const dismissedData = SafeStorage.getItem(STORAGE_KEYS.DISMISSED);
      if (dismissedData) {
        const parsed = JSON.parse(dismissedData);
        dismissedNotifications.current = new Set(parsed);
      }
    } catch (error) {
      console.warn('[TaskNotifications] Failed to load dismissed notifications:', error);
    }
  }, []);

  // Save dismissed notifications to storage (debounced)
  const saveDismissedNotifications = useCallback(
    debounce(() => {
      try {
        const data = JSON.stringify(Array.from(dismissedNotifications.current));
        SafeStorage.setItem(STORAGE_KEYS.DISMISSED, data);
      } catch (error) {
        console.warn('[TaskNotifications] Failed to save dismissed notifications:', error);
      }
    }, 500),
    []
  );

  // Cleanup old dismissed notifications periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      SafeStorage.cleanup('task-last-shown-', TIMING_CONFIG.DISMISSED_RETENTION);
      SafeStorage.cleanup('task-dismissed-', TIMING_CONFIG.DISMISSED_RETENTION);
    }, TIMING_CONFIG.CLEANUP_INTERVAL);

    return () => clearInterval(cleanup);
  }, []);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('[TaskNotifications] Browser notification permission:', permission);
      });
    }
  }, []);

  // Show task notification (defined before checkTasks since it's used there)
  const showTaskNotification = useCallback(
    (task: Task) => {
      console.log('[TaskNotifications] Showing alarm notification for:', task.title);

      setActiveNotification(task);

      // Store last shown time
      SafeStorage.setItem(STORAGE_KEYS.LAST_SHOWN(task.id), Date.now().toString());

      // Close previous browser notification if any
      if (browserNotificationRef.current) {
        browserNotificationRef.current.close();
      }

      // Also show browser notification as backup
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          browserNotificationRef.current = new Notification('⏰ Task Reminder Alarm', {
            body: `${task.title} - ${task.priority.toUpperCase()} Priority`,
            icon: '/favicon.ico',
            tag: task.id,
            requireInteraction: true,
          });

          browserNotificationRef.current.onclick = () => {
            window.focus();
            browserNotificationRef.current?.close();
            router.push('/tasks');
          };
        } catch (error) {
          console.error('[TaskNotifications] Browser notification failed:', error);
        }
      }
    },
    [router]
  );

  // Check for tasks that need notifications (stable callback using refs)
  const checkTasks = useCallback(() => {
    const now = new Date();
    const nowTime = now.getTime();

    // Use refs to access current values without recreating interval
    const currentSnoozedTasks = snoozedTasksRef.current;
    const currentTasks = tasksRef.current;
    const currentActiveNotification = activeNotificationRef.current;

    // Check for snoozed tasks that need to ring again
    const tasksToRingAgain = currentSnoozedTasks.filter(
      (snoozed) => nowTime >= snoozed.snoozeUntil
    );

    if (tasksToRingAgain.length > 0) {
      // FIX: Handle multiple snoozed tasks
      const [first, ...rest] = tasksToRingAgain;
      setActiveNotification(first.task);

      // Reschedule remaining tasks for 1 minute later to avoid overlap
      setSnoozedTasks((prev) => [
        ...prev.filter((s) => !tasksToRingAgain.includes(s)),
        ...rest.map((r) => ({ ...r, snoozeUntil: nowTime + TIMING_CONFIG.RETRY_DELAY })),
      ]);

      console.log('[TaskNotifications] Ringing again after snooze:', first.task.title);
      return;
    }

    // Check for new tasks that need notifications
    currentTasks.forEach((task) => {
      // Skip if task is completed or doesn't have reminder enabled
      if (task.completed || !task.reminder_enabled || !task.due_date) {
        return;
      }

      // Skip if already dismissed
      const notificationKey = `${task.id}-${task.due_date}-${task.due_time}`;
      if (dismissedNotifications.current.has(notificationKey)) {
        return;
      }

      // Skip if already showing this notification
      if (currentActiveNotification?.id === task.id) {
        return;
      }

      // Skip if task is snoozed
      if (currentSnoozedTasks.some((s) => s.task.id === task.id)) {
        return;
      }

      // Parse due date and time
      const dueDate = new Date(task.due_date);

      if (task.due_time) {
        // Validate time format (HH:MM)
        const timeMatch = task.due_time.match(/^(\d{1,2}):(\d{2})$/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          dueDate.setHours(hours, minutes, 0, 0);
        } else {
          // Invalid time format, default to 9 AM
          console.warn('[TaskNotifications] Invalid time format:', task.due_time);
          dueDate.setHours(9, 0, 0, 0);
        }
      } else {
        // If no time specified, set to 9 AM
        dueDate.setHours(9, 0, 0, 0);
      }

      // Calculate reminder time
      const reminderTime = new Date(dueDate);
      reminderTime.setMinutes(reminderTime.getMinutes() - (task.reminder_minutes_before || 15));

      // Check if it's time to show notification
      // Show notification if current time is past reminder time and before due time + 1 hour
      const oneHourAfterDue = new Date(dueDate);
      oneHourAfterDue.setHours(oneHourAfterDue.getHours() + 1);

      if (now >= reminderTime && now <= oneHourAfterDue) {
        // Check if we've shown this notification before
        if (!shownNotifications.current.has(notificationKey)) {
          showTaskNotification(task);
          shownNotifications.current.add(notificationKey);
        } else {
          // If shown before and not dismissed, ring again every 5 minutes
          const lastShownTime = parseInt(
            SafeStorage.getItem(STORAGE_KEYS.LAST_SHOWN(task.id)) || '0',
            10
          );
          const fiveMinutesAgo = nowTime - TIMING_CONFIG.SNOOZE_DURATION;

          if (lastShownTime < fiveMinutesAgo) {
            showTaskNotification(task);
          }
        }
      }
    });
  }, [showTaskNotification]);

  // Set up interval with stable callback
  useEffect(() => {
    checkIntervalRef.current = setInterval(checkTasks, TIMING_CONFIG.CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkTasks]);

  const handleDismiss = useCallback(() => {
    if (!activeNotification) return;

    const notificationKey = `${activeNotification.id}-${activeNotification.due_date}-${activeNotification.due_time}`;

    // Mark as dismissed
    dismissedNotifications.current.add(notificationKey);
    saveDismissedNotifications();

    // Remove from snoozed tasks if present
    setSnoozedTasks((prev) => prev.filter((s) => s.task.id !== activeNotification.id));

    // Clear last shown time
    SafeStorage.removeItem(STORAGE_KEYS.LAST_SHOWN(activeNotification.id));

    // Close browser notification
    if (browserNotificationRef.current) {
      browserNotificationRef.current.close();
      browserNotificationRef.current = null;
    }

    setActiveNotification(null);

    console.log('[TaskNotifications] Alarm dismissed for:', activeNotification.title);
  }, [activeNotification, saveDismissedNotifications]);

  const handleSnooze = useCallback(() => {
    if (!activeNotification) return;

    // Snooze for 5 minutes
    const snoozeUntil = Date.now() + TIMING_CONFIG.SNOOZE_DURATION;

    setSnoozedTasks((prev) => [
      ...prev.filter((s) => s.task.id !== activeNotification.id),
      { task: activeNotification, snoozeUntil },
    ]);

    // Close browser notification
    if (browserNotificationRef.current) {
      browserNotificationRef.current.close();
      browserNotificationRef.current = null;
    }

    setActiveNotification(null);

    console.log('[TaskNotifications] Alarm snoozed for 5 minutes:', activeNotification.title);
  }, [activeNotification]);

  const handleTaskClick = useCallback(() => {
    handleDismiss();
    router.push('/tasks');
  }, [handleDismiss, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (browserNotificationRef.current) {
        browserNotificationRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {activeNotification && (
        <AlarmNotification
          task={activeNotification}
          onDismiss={handleDismiss}
          onSnooze={handleSnooze}
          onTaskClick={handleTaskClick}
        />
      )}
    </>
  );
}
