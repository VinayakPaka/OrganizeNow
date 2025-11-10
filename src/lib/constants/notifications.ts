/**
 * Notification System Constants
 */

// Alarm Sound Configuration
export const ALARM_CONFIG = {
  BEEP_DURATION: 0.15,
  SHORT_PAUSE: 0.1,
  LONG_PAUSE: 0.4,
  FREQUENCY: 880, // Hz
  VOLUME: 0.3,
  OSCILLATOR_TYPE: 'sine' as OscillatorType,
} as const;

// Timing Configuration
export const TIMING_CONFIG = {
  SNOOZE_DURATION: 5 * 60 * 1000, // 5 minutes in ms
  CHECK_INTERVAL: 10 * 1000, // 10 seconds in ms
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour in ms
  DISMISSED_RETENTION: 24 * 60 * 60 * 1000, // 24 hours in ms
  RETRY_DELAY: 60 * 1000, // 1 minute for retry
} as const;

// Custom Reminder Limits
export const REMINDER_LIMITS = {
  MIN_MINUTES: 1,
  MAX_MINUTES: 10080, // 1 week
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  LAST_SHOWN: (taskId: string) => `task-last-shown-${taskId}`,
  DISMISSED: 'task-dismissed-notifications',
  SNOOZED: 'task-snoozed-notifications',
} as const;
