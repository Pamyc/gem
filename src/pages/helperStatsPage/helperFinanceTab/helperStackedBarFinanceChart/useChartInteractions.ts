
import { useEffect, RefObject } from 'react';
import { EChartInstance } from '../../../../components/charts/EChartComponent';

export const useChartInteractions = (
  chartRef: RefObject<EChartInstance | null>,
  option: any
) => {
  useEffect(() => {
    const chart = chartRef.current?.getInstance();
    if (!chart) return;

    const handleMouseOver = (params: any) => {
      if (params.componentType === 'series' && params.seriesName) {
        chart.dispatchAction({
          type: 'highlight',
          seriesName: params.seriesName
        });
      }
    };

    const handleMouseOut = (params: any) => {
      if (params.componentType === 'series' && params.seriesName) {
        chart.dispatchAction({
          type: 'downplay',
          seriesName: params.seriesName
        });
      }
    };

    chart.on('mouseover', handleMouseOver);
    chart.on('mouseout', handleMouseOut);

    return () => {
      chart.off('mouseover', handleMouseOver);
      chart.off('mouseout', handleMouseOut);
    };
  }, [option]);
};
