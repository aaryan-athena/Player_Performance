import React, { useMemo } from 'react';

/**
 * PerformanceChart component - Displays performance trends and charts
 * Requirements: 5.2, 5.4 - Create performance score charts and add performance trend visualization
 */
const PerformanceChart = ({ matches = [], title = "Performance Trend" }) => {
  // Process matches data for chart display
  const chartData = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    
    return matches
      .slice()
      .reverse() // Show chronological order
      .slice(-10) // Show last 10 matches
      .map((match, index) => ({
        index: index + 1,
        score: match.calculatedScore || 0,
        date: match.date ? new Date(match.date.seconds * 1000) : new Date(),
        sport: match.sport
      }));
  }, [matches]);

  // Calculate chart dimensions and scaling
  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 40;
  const maxScore = 100;
  const minScore = 0;

  // Create SVG path for the line chart
  const createPath = (data) => {
    if (data.length === 0) return '';
    
    const xStep = (chartWidth - 2 * padding) / Math.max(data.length - 1, 1);
    const yScale = (chartHeight - 2 * padding) / (maxScore - minScore);
    
    return data
      .map((point, index) => {
        const x = padding + index * xStep;
        const y = chartHeight - padding - (point.score - minScore) * yScale;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Create grid lines
  const createGridLines = () => {
    const lines = [];
    const yStep = (chartHeight - 2 * padding) / 4;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + i * yStep;
      lines.push(
        <line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={chartWidth - padding}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    }
    
    return lines;
  };

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📈</div>
            <p className="text-gray-500">No performance data to display</p>
            <p className="text-gray-400 text-sm">Charts will appear after matches are recorded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Chart Container */}
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
          {/* Grid lines */}
          {createGridLines()}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = chartHeight - padding - ((value - minScore) / (maxScore - minScore)) * (chartHeight - 2 * padding);
            return (
              <text
                key={value}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            );
          })}
          
          {/* Performance line */}
          <path
            d={createPath(chartData)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {chartData.map((point, index) => {
            const xStep = (chartWidth - 2 * padding) / Math.max(chartData.length - 1, 1);
            const yScale = (chartHeight - 2 * padding) / (maxScore - minScore);
            const x = padding + index * xStep;
            const y = chartHeight - padding - (point.score - minScore) * yScale;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={getScoreColor(point.score)}
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                {/* Tooltip on hover */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>
                    {`Match ${index + 1}: ${point.score} points (${point.date.toLocaleDateString()})`}
                  </title>
                </circle>
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-10">
          {chartData.map((point, index) => (
            <div key={index} className="text-xs text-gray-500 text-center">
              <div>Match {index + 1}</div>
              <div className="text-gray-400">
                {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chart Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Excellent (80+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600">Good (60-79)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Needs Improvement (&lt;60)</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;