'use client';

import { Task } from '@/store/slices/tasksSlice';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface TasksListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  filter: 'all' | 'today' | 'upcoming' | 'completed';
}

/**
 * TasksList component
 * Displays filtered list of tasks
 */
export function TasksList({
  tasks,
  onToggleComplete,
  onDelete,
  onTaskClick,
  onCreateTask,
  filter,
}: TasksListProps) {
  // Filter tasks based on current filter
  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case 'today':
        return tasks.filter((task) => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime() && !task.completed;
        });

      case 'upcoming':
        return tasks.filter((task) => {
          if (!task.due_date || task.completed) return false;
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() >= tomorrow.getTime();
        });

      case 'completed':
        return tasks.filter((task) => task.completed);

      case 'all':
      default:
        return tasks.filter((task) => !task.completed);
    }
  };

  const filteredTasks = getFilteredTasks();

  // Group tasks by date
  const groupTasksByDate = () => {
    const groups: { [key: string]: Task[] } = {
      overdue: [],
      today: [],
      tomorrow: [],
      upcoming: [],
      noDate: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filteredTasks.forEach((task) => {
      if (!task.due_date) {
        groups.noDate.push(task);
        return;
      }

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today && !task.completed) {
        groups.overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    return groups;
  };

  const groupedTasks = filter === 'all' ? groupTasksByDate() : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <button
            type="button"
            onClick={onCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {/* Task count */}
        <p className="text-sm text-gray-600">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'completed'
                ? 'Completed tasks will appear here'
                : 'Create your first task to get started'}
            </p>
            {filter !== 'completed' && (
              <button
                type="button"
                onClick={onCreateTask}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Create Task
              </button>
            )}
          </div>
        ) : groupedTasks ? (
          // Grouped view (for 'all' filter)
          <div className="space-y-8">
            {groupedTasks.overdue.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
                  Overdue ({groupedTasks.overdue.length})
                </h3>
                <div className="space-y-3">
                  {groupedTasks.overdue.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedTasks.today.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">
                  Today ({groupedTasks.today.length})
                </h3>
                <div className="space-y-3">
                  {groupedTasks.today.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedTasks.tomorrow.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Tomorrow ({groupedTasks.tomorrow.length})
                </h3>
                <div className="space-y-3">
                  {groupedTasks.tomorrow.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedTasks.upcoming.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Upcoming ({groupedTasks.upcoming.length})
                </h3>
                <div className="space-y-3">
                  {groupedTasks.upcoming.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedTasks.noDate.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  No Due Date ({groupedTasks.noDate.length})
                </h3>
                <div className="space-y-3">
                  {groupedTasks.noDate.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Simple list view (for other filters)
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
