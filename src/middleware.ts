import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Use 'jose' for middleware as 'jsonwebtoken' relies on Node.js runtime APIs not available in Edge Runtime
const JWT_ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || 'your-secret-key'
);

const ipRateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('accessToken')?.value;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // Rate Limiting
    const now = Date.now();
    const rateData = ipRateLimit.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
        rateData.count = 1;
        rateData.lastReset = now;
    } else {
        rateData.count++;
    }
    ipRateLimit.set(ip, rateData);

    if (rateData.count > MAX_REQUESTS) {
        return new NextResponse(JSON.stringify({ message: 'Too many requests' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let response = NextResponse.next();

    // Protected Routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            await jwtVerify(token, JWT_ACCESS_SECRET);
        } catch (error) {
            console.error('JWT verification failed:', error);
            // If access token fails, try refresh token? Or just redirect to login for simplicity in this middleware
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    return response;

}

export const config = {
    matcher: ['/dashboard/:path*'],
};
