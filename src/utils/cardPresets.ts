
import { CardElement, CardConfig } from '../types/card';

export const getPresetLayout = (preset: 'classic' | 'gradient' | 'minMax'): Partial<CardConfig> => {
  const commonElements: CardElement[] = [];
  
  // Base IDs
  const id = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 5)}`;

  if (preset === 'classic') {
    return {
      template: 'custom',
      width: '350px',
      height: '200px',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      colorTheme: 'blue',
      elements: [
        {
          id: id('title'),
          type: 'title',
          style: { top: 24, left: 24, fontSize: 14, color: '#6b7280', fontWeight: '500' }
        },
        {
          id: id('value'),
          type: 'value',
          style: { top: 60, left: 24, fontSize: 36, color: '#111827', fontWeight: 'bold' }
        },
        {
          id: id('icon'),
          type: 'icon',
          style: { top: 24, left: 290, fontSize: 24, color: '#3b82f6', backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, width: 48, height: 48 }
        },
        {
          id: id('trend'),
          type: 'trend',
          style: { top: 150, left: 24, fontSize: 12, color: '#059669', backgroundColor: '#d1fae5', borderRadius: 6, padding: 4 }
        }
      ]
    };
  }

  if (preset === 'gradient') {
    return {
      template: 'custom',
      width: '350px',
      height: '200px',
      gradientFrom: 'violet',
      gradientTo: 'fuchsia',
      // Reset background color to allow gradient to show in CustomCard
      backgroundColor: '', 
      borderColor: '',
      elements: [
        {
          id: id('icon'),
          type: 'icon',
          style: { top: 24, left: 24, fontSize: 24, color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10, width: 44, height: 44 }
        },
        {
          id: id('trend'),
          type: 'trend',
          style: { top: 24, left: 260, fontSize: 12, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 6 }
        },
        {
          id: id('value'),
          type: 'value',
          style: { top: 110, left: 24, fontSize: 42, color: '#ffffff', fontWeight: 'bold' }
        },
        {
          id: id('title'),
          type: 'title',
          style: { top: 160, left: 24, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }
        }
      ]
    };
  }

  if (preset === 'minMax') {
    return {
      template: 'custom',
      width: '350px',
      height: '200px',
      backgroundColor: '#111827',
      borderColor: '#374151',
      elements: [
        {
          id: id('icon'),
          type: 'icon',
          style: { top: 24, left: 24, fontSize: 20, color: '#60a5fa' }
        },
        {
          id: id('title'),
          type: 'title',
          style: { top: 26, left: 54, fontSize: 14, color: '#9ca3af', fontWeight: '500' }
        },
        {
          id: id('minLabel'),
          type: 'text',
          content: 'Min',
          style: { top: 130, left: 24, fontSize: 10, color: '#ef4444', fontWeight: 'bold' }
        },
        {
          id: id('minValue'),
          type: 'value',
          dataBind: 'min', // Needs support in logic, currently value defaults to main
          style: { top: 145, left: 24, fontSize: 24, color: '#ffffff', fontWeight: 'bold' }
        },
        {
          id: id('separator'),
          type: 'text',
          content: '—',
          style: { top: 145, left: 165, fontSize: 24, color: '#4b5563', fontWeight: '300' }
        },
        {
          id: id('maxLabel'),
          type: 'text',
          content: 'Max',
          style: { top: 130, left: 250, fontSize: 10, color: '#10b981', fontWeight: 'bold' }
        },
        {
          id: id('maxValue'),
          type: 'value',
          dataBind: 'max',
          style: { top: 145, left: 250, fontSize: 24, color: '#ffffff', fontWeight: 'bold' }
        }
      ]
    };
  }

  return {};
};
