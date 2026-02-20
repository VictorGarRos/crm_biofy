import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    color: string;
    className?: string;
    loading?: boolean;
}

export function MetricCard({
    label,
    value,
    change,
    icon: Icon,
    color,
    className,
    loading = false
}: MetricCardProps) {
    return (
        <div className={cn("biofy-card p-6 flex flex-col justify-between min-h-[160px]", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">{label}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-slate-200 animate-pulse rounded my-1" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                            {change !== undefined && (
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                                    change >= 0 ? "bg-emerald-100/80 text-emerald-600" : "bg-red-100/80 text-red-600"
                                )}>
                                    {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className={cn("p-2.5 rounded-xl", color)}>
                    <Icon className="w-5 h-5 text-slate-800" />
                </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">This month</p>
        </div>
    );
}
