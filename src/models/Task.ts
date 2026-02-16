import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this task.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'],
        default: 'ASSIGNED',
    },
    dueDate: {
        type: Date,
        required: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
