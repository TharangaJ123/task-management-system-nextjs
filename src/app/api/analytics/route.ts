
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        const user = await verifyAuth();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const stats = await Task.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(user.userId),
                    $or: [
                        { createdAt: { $gte: sevenDaysAgo } },
                        { completedAt: { $gte: sevenDaysAgo } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        }
                    },
                    createdCount: { $sum: 1 },
                    completedCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "COMPLETED"] },
                                        { $gte: ["$completedAt", sevenDaysAgo] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // The above aggregation groups by created date, which might not be exactly what we want 
        // if we want to show "Tasks Completed vs Created" on a specific day.
        // A task created on Monday and completed on Wednesday should count as 
        // Created on Monday and Completed on Wednesday.
        // The single group by above is insufficient for two independent timelines.

        // Let's use a facet to get two separate streams and then merge them in application logic
        // This is often cleaner than a complex singe pipeline for independent dates

        const independentStats = await Task.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(user.userId),
                    $or: [
                        { createdAt: { $gte: sevenDaysAgo } },
                        { completedAt: { $gte: sevenDaysAgo } }
                    ]
                }
            },
            {
                $facet: {
                    created: [
                        { $match: { createdAt: { $gte: sevenDaysAgo } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    completed: [
                        {
                            $match: {
                                status: 'COMPLETED',
                                completedAt: { $gte: sevenDaysAgo }
                            }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        // Merge the results
        const result = independentStats[0];
        const dateMap = new Map<string, { date: string, created: number, completed: number }>();

        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dateMap.set(dateStr, { date: dateStr, created: 0, completed: 0 });
        }

        result.created.forEach((item: any) => {
            if (dateMap.has(item._id)) {
                dateMap.get(item._id)!.created = item.count;
            }
        });

        result.completed.forEach((item: any) => {
            if (dateMap.has(item._id)) {
                dateMap.get(item._id)!.completed = item.count;
            }
        });

        const chartData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({ data: chartData });

    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
