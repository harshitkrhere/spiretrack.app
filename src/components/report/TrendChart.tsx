import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card } from '../ui/Card';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TrendChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            borderColor: string;
            backgroundColor: string;
        }[];
    };
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: {
                        family: 'Inter',
                        size: 12
                    }
                }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                min: 0,
                max: 10,
                grid: {
                    color: '#f1f5f9'
                },
                ticks: {
                    font: {
                        family: 'Inter'
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: 'Inter'
                    }
                }
            }
        },
        elements: {
            line: {
                tension: 0.4 // Smooth curves
            },
            point: {
                radius: 4,
                hoverRadius: 6
            }
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Trends</h3>
            <div className="h-64 w-full">
                <Line options={options} data={data} />
            </div>
        </Card>
    );
};
