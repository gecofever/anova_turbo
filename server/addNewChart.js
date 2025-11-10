import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { addNewPage } from '../server/addNewPage'

const marginLegend = {
  id: 'marginLegend',
  afterInit(chart, args, options) {
    const fitValue = chart.legend.fit
    chart.legend.fit = function fit() {
      fitValue.bind(chart.legend)()
      let height = this.height += 20
      return height
    }
  }
}

let chartInstance;
let chartIndex = 0;
let chartInstances = {};

const addNewChart = (opcoes, pontos, title, type) => {
  const data = opcoes.map((option, index) => {
    const totalString = pontos[index] !== undefined ? pontos[index].toString() : '0.0';
    const total = parseFloat(totalString.replace(/,/g, '.'));
    return {
      option,
      total,
    };
  }).filter(row => row.option !== undefined);

  const truncatedData = data.slice(0, 20);

  chartIndex++;

  const canvasElement = document.createElement("canvas");
  canvasElement.id = `canvas_${chartIndex}`;
  canvasElement.width = 800;
  canvasElement.height = 600;

  const divElement = document.createElement("div");
  divElement.classList.add("div-chart")
  divElement.appendChild(canvasElement);

  const datalabelsConfig = {
    color: '#000',
    anchor: 'end',
    align: 'end',
    font: {
      weight: 'bold',
      size: 14
    }
  };

  let backgroundColors;
  let color;
  let width;
  let visibility = false;
  if (type === 'bar') {
    backgroundColors = ['rgba(156, 220, 1)'],
      color = '#393F49',
      width = 1
  } else {
    backgroundColors = ['#9CDC01', '#20AD81', '#2A3F40', '#B4B4B4'],
      visibility = true
  }

  const buttonElement = document.createElement("button");
  buttonElement.textContent = "Alternar Gráfico";
  buttonElement.classList.add('update-chart-button')
  buttonElement.addEventListener('click', (event) => {
      const pageId = event.target.closest('.a4').id;
      updateChart(pageId);
  });

  const section = document.createElement("section");
  section.classList.add("container");

  const a4 = addNewPage(title, false, true);

  a4.appendChild(divElement);
  a4.appendChild(buttonElement);

  section.appendChild(a4);

  const chartSection = document.getElementById('tableSection');
  chartSection.appendChild(section);

  chartInstance = new Chart(canvasElement, {
    type: type,
    data: {
      labels: truncatedData.map((row) => row.option),
      datasets: [
        {
          label: title,
          data: truncatedData.map((row) => row.total.toFixed(1)),
          backgroundColor: backgroundColors,
          borderColor: color,
          borderWidth: width,
        },
      ],
    },
    options: {
      layout: {
        padding: 10
      },
      indexAxis: "y",
      plugins: {
        datalabels: datalabelsConfig,
        legend: {
          display: visibility,
          labels: {
            position: 'top',
            font: {
              weight: 'bold',
              size: 14
            }
          }
        }
      },
      scales: {
        y: {
          grid: {
            display: false
          },
          ticks: {
            display: true,
            color: '#000',
            font: {
              weight: 'bold'
            }
          },
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            display: false
          },
          min: 0,
          max: 200,
        }
      },
    },
    plugins: [ChartDataLabels, marginLegend],
    datalabels: {
      color: '#111',
      textAlign: 'center',
    }
  });

  chartInstances[canvasElement.id] = chartInstance;
};

const updateChart = (pageId) => {
  const canvasElement = document.getElementById(pageId).querySelector("canvas");

  if (!canvasElement) {
    console.error("Canvas element not found for page ID: ", pageId);
    return;
  }

  const canvasId = canvasElement.id;
  const chartInstance = chartInstances[canvasId];

  if (!chartInstance) {
    console.error("Chart instance not found for canvas ID: ", canvasId);
    return;
  }

  const chartType = chartInstance.config.type === 'bar' ? 'pie' : 'bar';
  const type = chartType === 'bar' ? 'bar' : 'pie';

  const datalabelsConfig = {
    color: '#000',
    anchor: 'end',
    align: 'end',
    font: {
      weight: 'bold',
      size: 14
    }
  };

  const ticksDisplay = type === 'bar'

  let backgroundColors;
  let color;
  let width;
  let visibility = false;
  if (type === 'bar') {
    backgroundColors = ['rgba(156, 220, 1)'],
    color = '#393F49',
    width = 1;
  } else {
    backgroundColors = ['#9CDC01', '#20AD81', '#2A3F40', '#B4B4B4'];
    visibility = true;
  }

  chartInstance.config.type = chartType;
  chartInstance.config.options.plugins.datalabels = datalabelsConfig;
  chartInstance.config.options.scales.y.ticks.display = ticksDisplay;
  chartInstance.config.data.datasets[0].backgroundColor = backgroundColors;
  chartInstance.config.data.datasets[0].borderColor = color;
  chartInstance.config.data.datasets[0].borderWidth = width;
  chartInstance.config.options.plugins.legend.display = visibility;

  chartInstance.update();
};

export default addNewChart;
