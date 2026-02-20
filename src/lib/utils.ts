import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SalesMetric = {
  label: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color: string;
};

export type ChartDataPoint = {
  date: string;
  demos: number;
  ventas: number;
};

export type TableRowData = {
  date: string;
  entregados: number;
  confirmados: number;
  demos: number;
  ventas: number;
};
