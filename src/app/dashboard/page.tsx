'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import ProductivityChart from '@/components/ProductivityChart';
import { Plus, LogOut, Layout, User, Search, Filter, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
    createdAt: string;
    completedAt?: string;
}

export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | Task['status']>('ALL');

    // New Task State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    // Edit Task State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editTaskDesc, setEditTaskDesc] = useState('');
    const [editTaskDueDate, setEditTaskDueDate] = useState('');
    const [editTaskStatus, setEditTaskStatus] = useState<Task['status']>('ASSIGNED');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchTasks();
        }
    }, [user, loading, router]);

    const fetchTasks = async () => {
        setIsLoadingTasks(true);
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDesc,
                    dueDate: newTaskDueDate,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setTasks([data.task, ...tasks]);
                setShowCreateModal(false);
                setNewTaskTitle('');
                setNewTaskDesc('');
                setNewTaskDueDate('');
            }
        } catch (error) {
            console.error('Failed to create task', error);
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setEditTaskTitle(task.title);
        setEditTaskDesc(task.description || '');
        setEditTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        setEditTaskStatus(task.status);
        setShowEditModal(true);
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;

        try {
            const res = await fetch(`/api/tasks/${editingTask._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTaskTitle,
                    description: editTaskDesc,
                    dueDate: editTaskDueDate,
                    status: editTaskStatus,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(tasks.map(t => t._id === editingTask._id ? data.task : t));
                setShowEditModal(false);
                setEditingTask(null);
            }
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        // Optimistic update
        setTasks(tasks.filter(t => t._id !== id));

        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                // Revert if failed
                fetchTasks();
                alert('Failed to delete task');
            }
        } catch (error) {
            fetchTasks();
            alert('Failed to delete task');
        }
    };

    const handleStatusChange = async (id: string, newStatus: Task['status']) => {
        // Optimistic update
        setTasks(tasks.map(t => {
            if (t._id === id) {
                return {
                    ...t,
                    status: newStatus,
                    completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined
                };
            }
            return t;
        }));

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                fetchTasks(); // Revert
            }
        } catch (error) {
            fetchTasks();
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

            <nav className="bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                                <Layout size={20} />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                TaskFlow
                            </h1>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 rounded-full border border-gray-200/50">
                                <div className="bg-white p-1 rounded-full shadow-sm text-gray-600">
                                    <User size={16} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 pr-2">{user.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-screen-2xl mx-auto py-8 sm:px-6 lg:px-8 relative z-10">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Project Board</h2>
                            <p className="text-gray-500 mt-1">Manage your tasks and track progress</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
                        >
                            <Plus size={18} className="mr-2" />
                            New Task
                        </motion.button>
                    </div>

                    <ProductivityChart />

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative min-w-[200px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Filter size={18} />
                            </div>
                            <select
                                className="block w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ASSIGNED">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Done</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showCreateModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowCreateModal(false)}
                                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
                                ></motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-50 overflow-hidden"
                                >
                                    <div className="p-6 sm:p-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                                <Plus size={24} />
                                            </div>
                                            Create New Task
                                        </h3>

                                        <form onSubmit={handleCreateTask} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    placeholder="What needs to be done?"
                                                    value={newTaskTitle}
                                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                                <textarea
                                                    className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                                    rows={4}
                                                    placeholder="Add details about this task..."
                                                    value={newTaskDesc}
                                                    onChange={(e) => setNewTaskDesc(e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                                                <input
                                                    type="date"
                                                    className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    value={newTaskDueDate}
                                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCreateModal(false)}
                                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                                >
                                                    Create Task
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showEditModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowEditModal(false)}
                                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
                                ></motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-50 overflow-hidden"
                                >
                                    <div className="p-6 sm:p-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                                <Edit2 size={24} />
                                            </div>
                                            Edit Task
                                        </h3>

                                        <form onSubmit={handleUpdateTask} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    placeholder="What needs to be done?"
                                                    value={editTaskTitle}
                                                    onChange={(e) => setEditTaskTitle(e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                                <textarea
                                                    className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                                    rows={4}
                                                    placeholder="Add details about this task..."
                                                    value={editTaskDesc}
                                                    onChange={(e) => setEditTaskDesc(e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                                                <select
                                                    className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                                    value={editTaskStatus}
                                                    onChange={(e) => setEditTaskStatus(e.target.value as any)}
                                                >
                                                    <option value="ASSIGNED">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="COMPLETED">Done</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                                                <input
                                                    type="date"
                                                    className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    value={editTaskDueDate}
                                                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEditModal(false)}
                                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {isLoadingTasks ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                                <p className="text-gray-500">Loading your board...</p>
                            </div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                                <Layout size={32} />
                            </div>
                            <h3 className="mt-2 text-xl font-medium text-gray-900">No tasks yet</h3>
                            <p className="mt-1 text-gray-500 max-w-sm mx-auto">Get started by creating a new task. Your board is waiting for you!</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Create Task
                                </button>
                            </div>
                        </div>
                    ) : (
                        <KanbanBoard
                            tasks={filteredTasks}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                            onEdit={handleEditTask}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
