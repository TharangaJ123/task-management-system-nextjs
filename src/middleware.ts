import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Use 'jose' for middleware as 'jsonwebtoken' relies on Node.js runtime APIs not available in Edge Runtime
const JWT_ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || 'your-secret-key'
);

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('accessToken')?.value;

    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            await jwtVerify(token, JWT_ACCESS_SECRET);
            return NextResponse.next();
        } catch (error) {
            console.error('JWT verification failed:', error);
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
