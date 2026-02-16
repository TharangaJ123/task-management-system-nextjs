import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Ideally put this in .env

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = loginSchema.parse(body);

        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate Access Token (Short-lived)
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: '15m' }
        );

        // Generate Refresh Token (Long-lived)
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: '7d' }
        );

        const response = NextResponse.json(
            {
                message: 'Login successful',
                user: { id: user._id, name: user.name, email: user.email },
            },
            { status: 200 }
        );

        // Set Access Token Cookie
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        // Set Refresh Token Cookie
        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation Error', errors: error.issues },
                { status: 400 }
            );
        }
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
