import { useEffect } from 'react';
import useGoogleCharts from './useGoogleCharts';

// Declare google as a global variable
declare global {
  interface Window {
    google: any;
  }
}

const GeoChart = ({ data }) => {
  useGoogleCharts();

  useEffect(() => {
    if (window.google && window.google.charts && window.google.charts.setOnLoadCallback) {
      window.google.charts.setOnLoadCallback(drawRegionsMap);
    }

    function drawRegionsMap() {
      const transformedData = window.google.visualization.arrayToDataTable(data);
      const options = {
        enableRegionInteractivity: true,
        colorAxis: { colors: ['#a8eeff', '#4374e0'] }, // Example color range
        datalessRegionColor: '#ededed',
        defaultColor: '#f5f5f5',
      };
      const chart = new window.google.visualization.GeoChart(
        document.getElementById('regions_div')
      );
      chart.draw(transformedData, options);
    }
  }, [data]);

  return <div id="regions_div" className="h-full w-full"></div>;
};

export default GeoChart;
