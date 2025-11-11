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
import { Loader2, ListTodo, Calendar, CheckCircle, Bell, Settings, Search } from 'lucide-react';

/**
 * Tasks Dashboard Page
 * Task management with reminders and notifications
 */
export default function TasksPage() {
  const dispatch = useAppDispatch();
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
      await dispatch(
        updateTask({
          id: selectedTask.id,
          ...taskData,
        })
      );
    } else {
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
  const activeTasksCount = tasks.filter((task) => !task.completed).length;

  return (
    <>
      {/* Task Notifications System */}
      <TaskNotifications tasks={tasks} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Top Header Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeTasksCount} active • {completedTasksCount} completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search tasks"
                    className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                  />
                </div>
                <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Bell size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Filters</h2>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('all')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition ${
                      filter === 'all'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ListTodo size={20} />
                      <span className="font-medium">All Tasks</span>
                    </div>
                    <span className="text-sm font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {activeTasksCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('today')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition ${
                      filter === 'today'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={20} />
                      <span className="font-medium">Today</span>
                    </div>
                    <span className="text-sm font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {todayTasksCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('upcoming')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition ${
                      filter === 'upcoming'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={20} />
                      <span className="font-medium">Upcoming</span>
                    </div>
                    <span className="text-sm font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {upcomingTasksCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('completed')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition ${
                      filter === 'completed'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} />
                      <span className="font-medium">Completed</span>
                    </div>
                    <span className="text-sm font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {completedTasksCount}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Tasks List */}
            <div className="lg:col-span-3">
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
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-blue-600 dark:text-blue-400" />
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-400 px-6 py-4 rounded-3xl shadow-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
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
