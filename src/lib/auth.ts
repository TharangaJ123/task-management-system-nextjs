import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
    userId: string;
    email: string;
}

export async function verifyAuth(): Promise<AuthPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AuthPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}
