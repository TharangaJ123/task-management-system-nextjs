import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        await dbConnect();
        const user = await User.findById(auth.userId).select('-password');

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
