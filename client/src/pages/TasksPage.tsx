import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Briefcase,
} from 'lucide-react';
import { TaskModal } from '../components/TaskModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  calculatedPriority: string;
  priorityColor: string;
  dueDate: string;
  startDate: string;
  status: string;
  informCEO: boolean;
  assignedTo?: { _id: string; name: string; email: string };
  relatedCompanyId?: { _id: string; name: string };
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedPriority !== 'All') params.priority = selectedPriority;
      if (searchQuery.trim()) params.search = searchQuery;

      const res = await api.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedStatus, selectedPriority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenDeleteConfirm = (task: Task) => {
    setTaskToDelete(task);
    setIsConfirmOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${taskToDelete._id}`);
      setIsConfirmOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            <span>My Tasks & Priority Engine</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personal assistant task manager automatically sorted by calculated urgency and deadline rules.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Task</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <span className="font-semibold">Priority:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical 🔴</option>
            <option value="High">High 🟠</option>
            <option value="Medium">Medium 🟢</option>
            <option value="Low">Low ⚪</option>
          </select>
        </div>
      </div>

      {/* Task List Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Querying MongoDB tasks database...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Add Task" to create a new task. Every task will be persisted in MongoDB and sorted by priority.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                task.status === 'Completed' ? 'bg-slate-50/70 opacity-75' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Status Toggle Checkbox */}
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition flex-shrink-0 mt-0.5 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border-2 border-slate-300 hover:border-indigo-600'
                  }`}
                  title={task.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                >
                  {task.status === 'Completed' && <CheckCircle className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`font-bold text-sm text-slate-900 ${
                        task.status === 'Completed' ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        task.calculatedPriority === 'Critical'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : task.calculatedPriority === 'High'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {task.calculatedPriority || task.priority}
                    </span>

                    {task.informCEO && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center space-x-1">
                        <Briefcase className="w-3 h-3" />
                        <span>Inform CEO</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 flex-wrap">
                    <span className="font-semibold text-slate-700">{task.category}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                    </span>
                    {task.relatedCompanyId && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-600 font-medium">{task.relatedCompanyId.name}</span>
                      </>
                    )}
                    {task.assignedTo && (
                      <>
                        <span>•</span>
                        <span>Assigned: {task.assignedTo.name}</span>
                      </>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 mt-2 font-normal line-clamp-2">{task.description}</p>
                  )}
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleOpenEditModal(task)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                  title="Edit Task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenDeleteConfirm(task)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchTasks}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action will permanently remove it from MongoDB.`}
        confirmText="Delete Task"
        isLoading={isDeleting}
        onConfirm={handleDeleteTask}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
