import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Update a task's details by ID.
 *     tags:
 *       - Tasks
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ASSIGNED, IN_PROGRESS, COMPLETED]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a task
 *     description: Delete a task by ID.
 *     tags:
 *       - Tasks
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const updateTaskSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
    dueDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const validatedData = updateTaskSchema.parse(body);

        // Handle completedAt logic
        const updateData: any = { ...validatedData };
        if (validatedData.status === 'COMPLETED') {
            updateData.completedAt = new Date();
        } else if (validatedData.status) {
            updateData.completedAt = null; // Reset if moved out of completed
        }

        await dbConnect();

        const task = await Task.findOneAndUpdate(
            { _id: id, userId: auth.userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!task) {
            return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task updated', task }, { status: 200 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Error', errors: error.issues }, { status: 400 });
        }
        console.error('Update task error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const task = await Task.findOneAndDelete({ _id: id, userId: auth.userId });

        if (!task) {
            return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
    } catch (error) {
        console.error('Delete task error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
