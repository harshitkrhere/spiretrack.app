import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DeepWorkChartProps {
  data: { week: string; hours: number }[];
}

export const DeepWorkChart: React.FC<DeepWorkChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No deep work data available
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Deep Work Hours',
        data: data.map(d => d.hours),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.5)');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(139, 92, 246, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 14,
        titleFont: { size: 13, weight: '600' as const },
        bodyFont: { size: 14, weight: '500' as const },
        displayColors: false,
        cornerRadius: 10,
        callbacks: {
          title: (items: any) => `Week of ${items[0].label}`,
          label: (context: any) => `${context.parsed.y} hours`,
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 50,
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: '500' as const },
          color: '#94a3b8',
          padding: 8,
          callback: (value: any) => `${value}h`,
        }
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: '500' as const },
          color: '#94a3b8',
          padding: 8,
        }
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
