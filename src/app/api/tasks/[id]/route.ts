import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

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

        await dbConnect();

        const task = await Task.findOneAndUpdate(
            { _id: id, userId: auth.userId },
            validatedData,
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
