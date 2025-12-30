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

interface EmotionalLoadChartProps {
  data: { week: string; load: number }[];
}

export const EmotionalLoadChart: React.FC<EmotionalLoadChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No emotional load data available
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Emotional Load',
        data: data.map(d => d.load),
        borderColor: '#f97316',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#f97316',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#f97316',
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
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 14, weight: 'normal' as const },
        displayColors: false,
        cornerRadius: 10,
        callbacks: {
          title: (items: any) => `Week of ${items[0].label}`,
          label: (context: any) => {
            const load = context.parsed.y;
            const level = load > 70 ? 'High' : load > 40 ? 'Moderate' : 'Low';
            return `Load: ${load} (${level})`;
          },
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
          font: { size: 11, weight: 'normal' as const },
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
          font: { size: 11, weight: 'normal' as const },
          color: '#94a3b8',
          padding: 8,
        }
      },
    },
  };

  return <Line data={chartData} options={options} />;
};
