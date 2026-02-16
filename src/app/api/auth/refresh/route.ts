import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { message: 'Refresh token not found' },
            { status: 401 }
        );
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        ) as { userId: string };

        // Generate new Access Token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId }, // In a real app, you might want to fetch the user again to ensure they exist/aren't banned
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: '15m' }
        );

        const response = NextResponse.json(
            { message: 'Token refreshed' },
            { status: 200 }
        );

        // Set prompt Access Token Cookie
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json(
            { message: 'Invalid refresh token' },
            { status: 403 }
        );
    }
}
