
import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { Box, AlertTriangle, Loader2 } from 'lucide-react';
import EChartComponent from './EChartComponent';

interface Props {
  isDarkMode: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
  isDarkMode: boolean;
}

// 1. Error Boundary Component to catch WebGL/Library failures
class GlErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, errorInfo: '' };

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
    // Also try dynamic import to ensure it's loaded in bundle environment
    import('echarts-gl').then(() => {
        setIsReady(true);
    }).catch(err => {
        console.warn("echarts-gl dynamic import failed (might be using global script):", err);
        setIsReady(true);
    });
  }, []);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    visualMap: {
      show: false,
      dimension: 2,
      min: 0,
      max: 10,
      inRange: {
        color: ['#3b82f6', '#8b5cf6', '#ec4899']
      }
    },
    xAxis3D: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: { textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
    },
    yAxis3D: {
      type: 'category',
      data: ['Work', 'Life', 'Rest'],
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
    series: [{
      type: 'bar3D',
      data: [
        [0,0,5], [1,0,8], [2,0,4], [3,0,6], [4,0,2], [5,0,1], [6,0,0],
        [0,1,2], [1,1,3], [2,1,6], [3,1,8], [4,1,9], [5,1,4], [6,1,2],
        [0,2,8], [1,2,5], [2,2,4], [3,2,2], [4,2,1], [5,2,9], [6,2,10]
      ],
      shading: 'lambert',
      label: {
        show: false,
        fontSize: 16,
        borderWidth: 1
      },
      itemStyle: {
        opacity: 0.8
      },
      emphasis: {
        label: {
          fontSize: 20,
          color: '#900'
        },
        itemStyle: {
          color: '#f43f5e'
        }
      }
    }]
  };

  if (!isReady) {
      return <div className="h-64 flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden relative">
       {/* Header */}
       <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/80 dark:bg-black/40 p-2 pr-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
             <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
                <Box size={20} />
             </div>
             <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">3D Test Widget</h3>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                   WebGL Context
                </p>
             </div>
          </div>
       </div>

       <div className="h-[400px] w-full">
          <EChartComponent options={option} theme={isDarkMode ? 'dark' : 'light'} height="100%" />
       </div>
    </div>
  );
};

const GlTestWidget: React.FC<Props> = (props) => (
  <GlErrorBoundary isDarkMode={props.isDarkMode}>
    <GlTestContent {...props} />
  </GlErrorBoundary>
);

export default GlTestWidget;
