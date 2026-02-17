
'use client';

import { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface ChartData {
    date: string;
    created: number;
    completed: number;
}

interface ProductivityChartProps {
    refreshTrigger?: any;
}

export default function ProductivityChart({ refreshTrigger }: ProductivityChartProps) {
    const [data, setData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics');
                if (res.ok) {
                    const json = await res.json();

                    // Format dates for display (e.g., "Mon", "Tue")
                    const formattedData = json.data.map((item: any) => {
                        const date = new Date(item.date);
                        return {
                            ...item,
                            displayDate: date.toLocaleDateString('en-US', { weekday: 'short' }),
                            fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        };
                    });

                    setData(formattedData);
                }
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [refreshTrigger]);

    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center bg-white/50 rounded-2xl border border-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg mb-8"
        >
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Activity size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Productivity Trends</h3>
                    <p className="text-sm text-gray-500">Tasks created vs completed (Last 7 Days)</p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}
                            formatter={(value: any, name: any) => {
                                const seriesName = String(name).toLowerCase();
                                return [value, seriesName.includes('created') ? 'Tasks Created' : 'Tasks Completed'];
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area
                            type="monotone"
                            dataKey="created"
                            name="Created"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorCreated)"
                            strokeWidth={3}
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            name="Completed"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorCompleted)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
