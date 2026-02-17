'use client';

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';
import DraggableTaskCard from './DraggableTaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
    createdAt: string;
}

interface KanbanBoardProps {
    tasks: Task[];
    onStatusChange: (id: string, newStatus: Task['status']) => void;
    onDelete: (id: string) => void;
}

export default function KanbanBoard({ tasks, onStatusChange, onDelete }: KanbanBoardProps) {
    const [showAlert, setShowAlert] = useState(true);

    const columns: { id: Task['status']; title: string; bg: string }[] = [
        { id: 'ASSIGNED', title: 'To Do', bg: 'bg-indigo-50/50' },
        { id: 'IN_PROGRESS', title: 'In Progress', bg: 'bg-amber-50/50' },
        { id: 'COMPLETED', title: 'Done', bg: 'bg-emerald-50/50' },
    ];

    const getTasksByStatus = (status: Task['status']) => {
        return tasks.filter((task) => task.status === status);
    };

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as Task['status'];
        onStatusChange(draggableId, newStatus);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50/80 backdrop-blur-md border border-blue-100 p-4 mb-8 rounded-xl relative shadow-sm"
                        role="alert"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Info size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900">Drag & Drop Enabled</h4>
                                <p className="text-sm text-blue-700/80">
                                    Move tasks between columns to update their status instantly.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAlert(false)}
                                className="ml-auto p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-8 snap-x snap-mandatory">
                {columns.map((column) => (
                    <div key={column.id} className="flex-1 min-w-[320px] snap-center">
                        <div className={`h-full rounded-2xl p-4 border border-white/40 shadow-xl backdrop-blur-xl ${column.bg}`}>
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    {column.title}
                                    <span className="bg-white/50 px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-500 shadow-sm border border-white/20">
                                        {getTasksByStatus(column.id).length}
                                    </span>
                                </h3>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`min-h-[200px] transition-all duration-300 rounded-xl p-2 ${snapshot.isDraggingOver ? 'bg-white/40 shadow-inner ring-2 ring-indigo-500/20' : ''
                                            }`}
                                    >
                                        <AnimatePresence>
                                            {getTasksByStatus(column.id).map((task, index) => (
                                                <DraggableTaskCard
                                                    key={task._id}
                                                    task={task}
                                                    index={index}
                                                    onDelete={onDelete}
                                                />
                                            ))}
                                        </AnimatePresence>
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
