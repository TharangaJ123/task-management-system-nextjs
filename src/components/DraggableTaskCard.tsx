'use client';

import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Clock, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
    createdAt: string;
    completedAt?: string;
}

interface DraggableTaskCardProps {
    task: Task;
    index: number;
    onDelete: (id: string) => void;
}

export default function DraggableTaskCard({ task, index, onDelete }: DraggableTaskCardProps) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

    // Check if it was completed late
    const isCompletedLate = task.status === 'COMPLETED' && task.dueDate && task.completedAt && new Date(task.completedAt) > new Date(task.dueDate);

    // Check if it's currently late and in progress (same as overdue but specific for in progress)
    const isLateProgress = task.status === 'IN_PROGRESS' && isOverdue;

    const priorityColor = isOverdue || isCompletedLate ? 'text-red-500 font-bold' : 'text-gray-400';

    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3"
                    style={{ ...provided.draggableProps.style }}
                >
                    <motion.div
                        layoutId={task._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm transition-all duration-200 group relative overflow-hidden",
                            snapshot.isDragging && "shadow-2xl ring-2 ring-indigo-500/50 rotate-2 z-50 bg-white"
                        )}
                    >
                        {/* Decorative gradient blob */}
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors" />

                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <h4 className="font-semibold text-gray-800 line-clamp-1 text-md group-hover:text-indigo-600 transition-colors">
                                {task.title}
                            </h4>
                            <motion.button
                                whileHover={{ scale: 1.1, color: "#ef4444" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task._id);
                                }}
                                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 size={16} />
                            </motion.button>
                        </div>

                        {task.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed relative z-10">
                                {task.description}
                            </p>
                        )}

                        <div className="flex justify-between items-center text-xs pt-3 border-t border-gray-100/50 relative z-10">
                            <div className="flex items-center text-gray-400 gap-1.5">
                                <Calendar size={12} />
                                <span>{new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
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
                                <span>Hurry up! Complete this task!</span>
                            </div>
                        )}

                        {isLateProgress && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                <Clock size={14} className="flex-shrink-0" />
                                <span>Running Late!</span>
                            </div>
                        )}

                        {isCompletedLate && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100">
                                <AlertTriangle size={14} className="flex-shrink-0" />
                                <span>Completed Late</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </Draggable>
    );
}
