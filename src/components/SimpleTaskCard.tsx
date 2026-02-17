'use client';

import { motion } from 'framer-motion';
import { Clock, Trash2, Calendar, AlertTriangle, Edit2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task } from './DraggableTaskCard';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SimpleTaskCardProps {
    task: Task;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
}

export default function SimpleTaskCard({ task, onDelete, onEdit }: SimpleTaskCardProps) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
    const isCompletedLate = task.status === 'COMPLETED' && task.dueDate && task.completedAt && new Date(task.completedAt) > new Date(task.dueDate);
    const isLateProgress = task.status === 'IN_PROGRESS' && isOverdue;
    const priorityColor = isOverdue || isCompletedLate ? 'text-red-500 font-bold' : 'text-gray-400';

    return (
        <motion.div
            layoutId={`simple-${task._id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm transition-all duration-200 group relative overflow-hidden mb-3 h-full flex flex-col"
            )}
        >
            {/* Decorative gradient blob */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors" />

            <div className="flex justify-between items-start mb-2 relative z-10">
                <h4 className="font-semibold text-gray-800 line-clamp-1 text-md group-hover:text-indigo-600 transition-colors flex-1 pr-2">
                    {task.title}
                </h4>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <motion.button
                        whileHover={{ scale: 1.1, color: "#4f46e5" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        className="text-gray-400 sm:text-gray-300 p-1 hover:bg-indigo-50 rounded-full"
                        title="Edit Task"
                    >
                        <Edit2 size={16} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task._id);
                        }}
                        className="text-gray-400 sm:text-gray-300 p-1 hover:bg-red-50 rounded-full"
                        title="Delete Task"
                    >
                        <Trash2 size={16} />
                    </motion.button>
                </div>
            </div>

            {task.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed relative z-10 flex-grow">
                    {task.description}
                </p>
            )}

            <div className="flex justify-between items-center text-xs pt-3 border-t border-gray-100/50 relative z-10 mt-auto">
                <div className="flex items-center text-gray-400 gap-1.5">
                    <div className={cn(
                        "px-2 py-0.5 rounded-full font-medium",
                        task.status === 'ASSIGNED' ? "bg-indigo-100 text-indigo-700" :
                            task.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-700" :
                                "bg-emerald-100 text-emerald-700"
                    )}>
                        {task.status.replace('_', ' ')}
                    </div>
                </div>

                {task.dueDate && (
                    <div className={cn("flex items-center gap-1.5 font-medium bg-gray-50 px-2 py-1 rounded-full", priorityColor)}>
                        <Clock size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
            </div>

            {isOverdue && task.status === 'ASSIGNED' && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-pulse">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>Hurry up!</span>
                </div>
            )}
        </motion.div>
    );
}
