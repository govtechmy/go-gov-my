import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartData,
  ChartOptions,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface TimeseriesProps {
  className?: string;
  title: string;
  data: {
    labels: string[];
    datasets: {
      type: string;
      label: string;
      data: number[];
      fill: boolean;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
  enableGridX?: boolean;
  enableGridY?: boolean;
  enableAnimation?: boolean;
  tooltipCallback?: (tooltipItem: any) => string;
}

export default function Timeseries({
  className,
  title,
  data,
  enableGridX = false,
  enableGridY = true,
  enableAnimation = true,
  tooltipCallback,
}: TimeseriesProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: enableAnimation ? 1000 : 0,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        bodyFont: {
          size: 12,
        },
        padding: 12,
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
        callbacks: {
          label: tooltipCallback,
        },
        displayColors: false,
      },
    },
    scales: {
      x: {
        type: 'time', // Ensure x-axis uses time scale
        time: {
          unit: 'day', // Group data by day
          displayFormats: {
            day: 'dd-MMM-yyyy', // Format: "01-Jan-2024"
          },
          tooltipFormat: 'dd-MMM-yyyy', // Also updates tooltip format
        },
        grid: {
          display: enableGridX,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: 'rgb(107, 114, 128)',
        },
      },
      y: {
        grid: {
          display: enableGridY,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: 'rgb(107, 114, 128)',
          padding: 8,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className={className}>
      <Line data={data as ChartData<"line", number[], string>} options={options as ChartOptions<"line">} />
    </div>
  );
}