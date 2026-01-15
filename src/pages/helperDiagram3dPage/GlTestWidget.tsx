import React, { ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { Box, AlertTriangle, Loader2 } from 'lucide-react';
import EChartComponent from './EChartComponent';

interface Props {
  isDarkMode: boolean;
}

interface State {
  hasError: boolean;
  errorInfo: string;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
  isDarkMode: boolean;
}

// 1. Error Boundary Component to catch WebGL/Library failures
class GlErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  public state: State = { hasError: false, errorInfo: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ECharts GL Critical Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-red-200 dark:border-red-500/20 shadow-sm p-6 mb-8 flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
               <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">GL Rendering Failed</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">The 3D library (echarts-gl) could not be initialized.</p>
            <code className="text-xs bg-gray-100 dark:bg-black/20 p-2 rounded block text-red-500 font-mono">
              {this.state.errorInfo || "Unknown WebGL Error"}
            </code>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 2. The Actual 3D Chart Content
const GlTestContent: React.FC<Props> = ({ isDarkMode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ECharts and ECharts-GL are loaded globally via <script> tags in index.html.
    // This ensures they share the same instance and registers 3D components correctly.
    // We just set ready to true immediately.
    setIsReady(true);
  }, []);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    visualMap: {
      show: false,
      dimension: 2,
      min: 0,
      max: 15,
      inRange: {
        color: ['#3b82f6', '#8b5cf6', '#ec4899']
      }
    },
    xAxis3D: {
      type: 'category',
      data: ['X1', 'X2', 'X3', 'X4', 'X5'],
      axisLabel: { textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
    },
    yAxis3D: {
      type: 'category',
      data: ['Y1', 'Y2', 'Y3'],
      axisLabel: { textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
    },
    zAxis3D: {
      type: 'value',
      axisLabel: { textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      viewControl: {
        projection: 'perspective',
        autoRotate: true,
        autoRotateSpeed: 10,
        beta: 10
      },
      light: {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
      }
    },
    series: [
      {
        type: 'bar3D',
        data: [
          [0, 0, 5], [1, 0, 11], [2, 0, 3], [3, 0, 8], [4, 0, 12],
          [0, 1, 2], [1, 1, 8], [2, 1, 9], [3, 1, 4], [4, 1, 6],
          [0, 2, 7], [1, 2, 3], [2, 2, 5], [3, 2, 10], [4, 2, 2]
        ],
        shading: 'lambert',
        label: {
          show: false,
          fontSize: 16,
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20,
            color: '#900'
          },
          itemStyle: {
            color: '#900'
          }
        }
      }
    ]
  };

  if (!isReady) {
      return (
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6 mb-8 h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      );
  }

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-0 relative mb-8">
       {/* Status Badge */}
       <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/80 dark:bg-black/40 p-2 pr-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
             <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
                <Box size={20} />
             </div>
             <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">ECharts GL (3D)</h3>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   Библиотека активна
                </p>
             </div>
          </div>
       </div>
       
       <div className="h-64 w-full">
          <EChartComponent options={option} theme={isDarkMode ? 'dark' : 'light'} height="100%" />
       </div>
    </div>
  );
};

// Export wrapped component
export default function GlTestWidget(props: Props) {
  return (
    <GlErrorBoundary isDarkMode={props.isDarkMode}>
      <GlTestContent {...props} />
    </GlErrorBoundary>
  );
}