import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FocusTrendChartProps {
  data: { week: string; score: number }[];
}

export const FocusTrendChart: React.FC<FocusTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No focus data available
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Focus Score',
        data: data.map(d => d.score),
        borderColor: '#3b82f6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        borderWidth: 3,
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
    interaction: {
      intersect: false,
      mode: 'index' as const,
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
          label: (context: any) => `Focus: ${context.parsed.y}`,
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
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
          stepSize: 25,
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

  return <Line data={chartData} options={options} />;
};
