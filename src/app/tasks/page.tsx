'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  Task,
  setFilter,
} from '@/store/slices/tasksSlice';
import { TasksList } from '@/components/tasks/TasksList';
import { TaskForm, TaskFormData } from '@/components/tasks/TaskForm';
import { TaskNotifications } from '@/components/tasks/TaskNotifications';
import { Loader2, ListTodo, Calendar, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Tasks Dashboard Page
 * Task management with reminders and notifications
 */
export default function TasksPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { tasks, isLoading, error, filter } = useAppSelector((state) => state.tasks);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
    }
  }, [dispatch, isAuthenticated]);

  // Handle create task
  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskForm(true);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  // Handle save task
  const handleSaveTask = async (taskData: TaskFormData) => {
    if (selectedTask) {
      // Update existing task
      await dispatch(
        updateTask({
          id: selectedTask.id,
          ...taskData,
        })
      );
    } else {
      // Create new task
      await dispatch(createTask(taskData));
    }

    setShowTaskForm(false);
    setSelectedTask(null);
  };

  // Handle toggle completion
  const handleToggleComplete = async (task: Task) => {
    await dispatch(toggleTaskCompletion(task));
  };

  // Handle delete task
  const handleDeleteTask = async (id: string) => {
    await dispatch(deleteTask(id));
  };

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'today' | 'upcoming' | 'completed') => {
    dispatch(setFilter(newFilter));
  };

  // Calculate task counts
  const todayTasksCount = tasks.filter((task) => {
    if (!task.due_date || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }).length;

  const upcomingTasksCount = tasks.filter((task) => {
    if (!task.due_date || task.completed) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() >= tomorrow.getTime();
  }).length;

  const completedTasksCount = tasks.filter((task) => task.completed).length;

  return (
    <>
      {/* Task Notifications System */}
      <TaskNotifications tasks={tasks} />

      <div className="flex h-full bg-gray-50 dark:bg-gray-900">
        {/* Left Sidebar - Filters */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Filters</h2>

          {/* Filter buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <ListTodo size={20} />
                <span className="font-medium">All Tasks</span>
              </div>
              <span className="text-sm font-semibold">
                {tasks.filter((t) => !t.completed).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange('today')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                filter === 'today'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <span className="font-medium">Today</span>
              </div>
              <span className="text-sm font-semibold">{todayTasksCount}</span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange('upcoming')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                filter === 'upcoming'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <span className="font-medium">Upcoming</span>
              </div>
              <span className="text-sm font-semibold">{upcomingTasksCount}</span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange('completed')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                filter === 'completed'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span className="font-medium">Completed</span>
              </div>
              <span className="text-sm font-semibold">{completedTasksCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Tasks List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TasksList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
          onTaskClick={handleEditTask}
          onCreateTask={handleCreateTask}
          filter={filter}
        />

        {/* Loading/Error States */}
        {isLoading && tasks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75">
            <Loader2 size={32} className="animate-spin text-purple-600 dark:text-purple-400" />
          </div>
        )}

        {error && (
          <div className="absolute top-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={selectedTask}
          onSave={handleSaveTask}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedTask(null);
          }}
        />
      )}
      </div>
    </>
  );
}
