import { useEffect } from 'react';

const useGoogleCharts = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      (window as any).google.charts.load('current', {
        packages: ['geochart'],
      });
    };
    document.body.appendChild(script);
  }, []);
};

export default useGoogleCharts;
