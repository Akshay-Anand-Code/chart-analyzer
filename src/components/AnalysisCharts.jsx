import React from 'react';
import { Radar, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { parseAnalysisData } from '../utils/analysisUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalysisCharts = ({ analysisData, visible }) => {
  if (!visible || !analysisData || typeof analysisData !== 'string') {
    console.log('Early return: invalid props', { visible, analysisData });
    return null;
  }

  const parsedData = parseAnalysisData(analysisData);
  if (!parsedData || typeof parsedData !== 'object') {
    console.log('Early return: invalid parsed data', parsedData);
    return null;
  }

  if (typeof parsedData.confidence !== 'number' || 
      typeof parsedData.trendStrength !== 'number' || 
      typeof parsedData.riskLevel !== 'number' || 
      !Array.isArray(parsedData.targets)) {
    console.log('Early return: invalid data properties', parsedData);
    return null;
  }

  // Radar Chart Data
  const radarData = {
    labels: ['Confidence', 'Trend Strength', 'Risk Level', 'Volume'],
    datasets: [{
      label: 'Analysis Metrics',
      data: [
        parsedData.confidence,
        parsedData.trendStrength,
        parsedData.riskLevel,
        parsedData.volume || 0
      ],
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
    }]
  };

  // Price Targets Line Chart Data
  const targetData = {
    labels: ['Current', 'Target 1', 'Target 2', 'Target 3', 'Stop Loss'],
    datasets: [{
      label: 'Price Targets',
      data: [parsedData.currentPrice, ...parsedData.targets],
      borderColor: parsedData.trendDirection === 'bull' ? 
        'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
      backgroundColor: parsedData.trendDirection === 'bull' ? 
        'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  // Risk Assessment Bar Chart Data
  const riskData = {
    labels: ['Risk Level', 'Confidence', 'Trend Strength', 'RSI'],
    datasets: [{
      label: 'Key Metrics',
      data: [
        parsedData.riskLevel,
        parsedData.confidence,
        parsedData.trendStrength,
        parsedData.rsi || 0
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.5)',  // Red for risk
        'rgba(34, 197, 94, 0.5)',  // Green for confidence
        'rgba(59, 130, 246, 0.5)', // Blue for trend
        'rgba(168, 85, 247, 0.5)'  // Purple for RSI
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(168, 85, 247, 1)'
      ],
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'monospace'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'monospace'
        },
        bodyFont: {
          family: 'monospace'
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { 
          color: 'rgba(255, 255, 255, 0.7)', 
          font: { 
            family: 'monospace',
            size: 12
          } 
        },
        ticks: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'monospace'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'monospace'
          }
        }
      }
    }
  };

  console.log('Rendering charts with data:', { radarData, targetData, riskData });

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="bg-black/40 p-6 rounded-lg border border-green-500/20">
        <h3 className="text-green-400 font-mono mb-4">Analysis Overview</h3>
        <div className="h-[300px]">
          <Radar data={radarData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-black/40 p-6 rounded-lg border border-blue-500/20">
        <h3 className="text-blue-400 font-mono mb-4">Price Targets</h3>
        <div className="h-[300px]">
          <Line data={targetData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-black/40 p-6 rounded-lg border border-purple-500/20 col-span-2">
        <h3 className="text-purple-400 font-mono mb-4">Risk Assessment</h3>
        <div className="h-[300px]">
          <Bar data={riskData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts; 