import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a list of all tasks for the authenticated user, sorted by creation date.
 *     tags:
 *       - Tasks
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new task
 *     description: Create a new task with title, description, status, and due date.
 *     tags:
 *       - Tasks
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
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
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().optional(),
    status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
    dueDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

export async function GET() {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const tasks = await Task.find({ userId: auth.userId }).sort({ createdAt: -1 });

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        console.error('Fetch tasks error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = createTaskSchema.parse(body);

        await dbConnect();

        const task = await Task.create({
            ...validatedData,
            userId: auth.userId,
        });

        return NextResponse.json({ message: 'Task created', task }, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Error', errors: error.issues }, { status: 400 });
        }
        console.error('Create task error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
