'use client';

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
    createdAt: string;
}

interface TaskCardProps {
    task: Task;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, newStatus: Task['status']) => void;
}

export default function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
    const statusColors = {
        ASSIGNED: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
    };

    const nextStatus: Record<Task['status'], Task['status']> = {
        ASSIGNED: 'IN_PROGRESS',
        IN_PROGRESS: 'COMPLETED',
        COMPLETED: 'ASSIGNED', // Or stay completed? cycling for now
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 truncate w-3/4">
                        {task.title}
                    </h3>
                    <button
                        onClick={() => onStatusChange(task._id, nextStatus[task.status])}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${statusColors[task.status]}`}
                    >
                        {task.status.replace('_', ' ')}
                    </button>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 line-clamp-3">
                    {task.description || 'No description provided.'}
                </p>
                {task.dueDate && (
                    <p className="mt-2 text-xs text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                )}
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-2">
                <button
                    onClick={() => onDelete(task._id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                    Delete
                </button>
                {/* Future: Add Edit Button */}
            </div>
        </div>
    );
}
