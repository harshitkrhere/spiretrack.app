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
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

interface TrendData {
  week_start: string;
  value: number;
}

interface StressTrendChartProps {
  data: TrendData[];
  loading?: boolean;
}

export const StressTrendChart: React.FC<StressTrendChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-slate-600">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <div className="text-center">
          <p className="text-slate-600 mb-2">Not enough data</p>
          <p className="text-sm text-slate-500">Generate reports for at least 2 weeks to see trends</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => new Date(d.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Stress Level',
        data: data.map(d => d.value),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Warning Threshold (70)',
        data: data.map(() => 70),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Team Stress Level Trend',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
