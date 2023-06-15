// Import MQTT service
import { MQTTService } from "./mqttService.js";

// Target specific HTML items
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

// Holds the background color of all chart
var chartBGColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-background"
);
var chartFontColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-font-color"
);
var chartAxisColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-axis-color"
);

/*
  Event listeners for any HTML click
*/
menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});

themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");
  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");

  // Update Chart background
  chartBGColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-background"
  );
  chartFontColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-font-color"
  );
  chartAxisColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-axis-color"
  );
  updateChartsBackground();
});

/*
  Plotly.js graph and chart setup code
*/
var temperatureHistoryDiv = document.getElementById("temperature-history");
var humidityHistoryDiv = document.getElementById("humidity-history");
var pressureHistoryDiv = document.getElementById("pressure-history");
//var altitudeHistoryDiv = document.getElementById("altitude-history");

var temperatureGaugeDiv = document.getElementById("temperature-gauge");
var humidityGaugeDiv = document.getElementById("humidity-gauge");
var pressureGaugeDiv = document.getElementById("pressure-gauge");
//var altitudeGaugeDiv = document.getElementById("altitude-gauge");

const historyCharts = [
  temperatureHistoryDiv,
  humidityHistoryDiv,
  pressureHistoryDiv
];

const gaugeCharts = [
  temperatureGaugeDiv,
  humidityGaugeDiv,
  pressureGaugeDiv,
];

// History Data
var temperatureTrace = {
  x: [],
  y: [],
  name: "Temperature",
  mode: "lines+markers",
  type: "line",
};
var humidityTrace = {
  x: [],
  y: [],
  name: "Humidity",
  mode: "lines+markers",
  type: "line",
};
var pressureTrace = {
  x: [],
  y: [],
  name: "Pressure",
  mode: "lines+markers",
  type: "line",
};


var temperatureLayout = {
  autosize: true,
  title: {
    text: "Voltaje",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 10 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,
  },
};
var humidityLayout = {
  autosize: true,
  title: {
    text: "Corriente",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};
var pressureLayout = {
  autosize: true,
  title: {
    text: "Potencia",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};

var config = { responsive: true, displayModeBar: false };

// Event listener when page is loaded
window.addEventListener("load", (event) => {
  Plotly.newPlot(
    temperatureHistoryDiv,
    [temperatureTrace],
    temperatureLayout,
    config
  );
  Plotly.newPlot(humidityHistoryDiv, [humidityTrace], humidityLayout, config);
  Plotly.newPlot(pressureHistoryDiv, [pressureTrace], pressureLayout, config);

  // Get MQTT Connection
  fetchMQTTConnection();

  // Run it initially
  handleDeviceChange(mediaQuery);
});

// Gauge Data
var temperatureData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Voltaje" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 30 },
    gauge: {
      axis: { range: [0, 400] },
      steps: [
        { range: [0, 300], color: "lightgray" },
        { range: [0, 300], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 30,
      },
    },
  },
];

var humidityData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Corriente" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 50 },
    gauge: {
      axis: { range: [null, 100] },
      steps: [
        { range: [0, 20], color: "lightgray" },
        { range: [20, 30], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 30,
      },
    },
  },
];

var pressureData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Potencia" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 750 },
    gauge: {
      axis: { range: [null, 1000] },
      steps: [
        { range: [0, 300], color: "lightgray" },
        { range: [300, 700], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 30,
      },
    },
  },
];


var layout = { width: 300, height: 250, margin: { t: 0, b: 0, l: 0, r: 0 } };

Plotly.newPlot(temperatureGaugeDiv, temperatureData, layout);
Plotly.newPlot(humidityGaugeDiv, humidityData, layout);
Plotly.newPlot(pressureGaugeDiv, pressureData, layout);

// Will hold the arrays we receive from our BME280 sensor
// Temperature
let newTempXArray = [];
let newTempYArray = [];
// Humidity
let newHumidityXArray = [];
let newHumidityYArray = [];
// Pressure
let newPressureXArray = [];
let newPressureYArray = [];
// Altitude
//let newAltitudeXArray = [];
//let newAltitudeYArray = [];

// The maximum number of data points displayed on our scatter/line graph
let MAX_GRAPH_POINTS = 256;
let ctr = 0;

// Callback function that will retrieve our latest sensor readings and redraw our Gauge with the latest readings
function updateSensorReadings(jsonResponse) {
  let temperature = jsonResponse;
  updateBoxes(temperature);
  updateGauge(temperature);
}

// instanteneo  voltaje
function chart_00(jsonResponse) {
  let temperature = jsonResponse;
  updateCharts(
    temperatureHistoryDiv,
    newTempXArray,
    newTempYArray,
    temperature
  );
}


////current
// Callback function that will retrieve our latest sensor readings and redraw our Gauge with the latest readings
function updateSensorReadings00(jsonResponse) {
  let humidity = jsonResponse; 
  updateBoxesCurrent(humidity);
  updateGaugeCurrent(humidity);
}

function chart_01(jsonResponse) {
  let humidity = jsonResponse; 
  updateCharts(
    humidityHistoryDiv,
    newHumidityXArray,
    newHumidityYArray,
    humidity
  );
}
//
//power
// Callback function that will retrieve our latest sensor readings and redraw our Gauge with the latest readings
function updateSensorReadings02(jsonResponse) {
  let pressure = jsonResponse;
  updateBoxesPower(pressure);
  updateGaugePower(pressure);
}

function chart_02(jsonResponse) {
  let pressure = jsonResponse;
  updateCharts(
    pressureHistoryDiv,
    newPressureXArray,
    newPressureYArray,
    pressure
  );
}


//caja de voltaje
function updateBoxes(temperature) {
  let temperatureDiv = document.getElementById("temperature"); //get value
  //let humidityDiv = document.getElementById("humidity");
  //let pressureDiv = document.getElementById("pressure");
  //let altitudeDiv = document.getElementById("altitude");

  temperatureDiv.innerHTML = temperature + " V";
  //humidityDiv.innerHTML = humidity + " A";
  //pressureDiv.innerHTML = pressure + " W";
  //altitudeDiv.innerHTML = altitude + " m";
}

//caja de corriente
function updateBoxesCurrent(humidity) {
  //let temperatureDiv = document.getElementById("temperature"); //get value
  let humidityDiv = document.getElementById("humidity");
  //let pressureDiv = document.getElementById("pressure");
  //let altitudeDiv = document.getElementById("altitude");

  //temperatureDiv.innerHTML = temperature + " V";
  humidityDiv.innerHTML = humidity + " A";
  //pressureDiv.innerHTML = pressure + " W";
  //altitudeDiv.innerHTML = altitude + " m";
}

//caja de potencia
function updateBoxesPower(pressure) {
  //let temperatureDiv = document.getElementById("temperature"); //get value
  //let humidityDiv = document.getElementById("humidity");
  let pressureDiv = document.getElementById("pressure");
  //let altitudeDiv = document.getElementById("altitude");

  //temperatureDiv.innerHTML = temperature + " V";
  //humidityDiv.innerHTML = humidity + " A";
  pressureDiv.innerHTML = pressure + " W";
  //altitudeDiv.innerHTML = altitude + " m";
}

function updateGauge(temperature) {
  var temperature_update = {
    value: temperature,
  };
 // var humidity_update = {
   // value: humidity,
 // };
  //var pressure_update = {
    //value: pressure,
  //};
  Plotly.update(temperatureGaugeDiv, temperature_update);
  //Plotly.update(humidityGaugeDiv, humidity_update);
  //Plotly.update(pressureGaugeDiv, pressure_update);
  //Plotly.update(altitudeGaugeDiv, altitude_update);
}

function updateGaugeCurrent(humidity) {
  //var temperature_update = {
    //value: temperature,
  //};
  var humidity_update = {
    value: humidity,
  };
  //var pressure_update = {
    //value: pressure,
  //};
 // Plotly.update(temperatureGaugeDiv, temperature_update);
  Plotly.update(humidityGaugeDiv, humidity_update);
  //Plotly.update(pressureGaugeDiv, pressure_update);
  //Plotly.update(altitudeGaugeDiv, altitude_update);
}

function updateGaugePower(pressure) {
  var pressure_update = {
    value: pressure,
  };
  Plotly.update(pressureGaugeDiv, pressure_update);
}

function updateCharts(lineChartDiv, xArray, yArray, sensorRead) {
  if (xArray.length >= MAX_GRAPH_POINTS) {
    xArray.shift();
  }
  if (yArray.length >= MAX_GRAPH_POINTS) {
    yArray.shift();
  }
  var today = new Date();
  var now = today.toLocaleString();
  //console.log(now); date 
  xArray.push(ctr++);
  yArray.push(sensorRead);

  var data_update = {
    x: [xArray],
    y: [yArray],
  };

  Plotly.update(lineChartDiv, data_update);
}

function updateChartsBackground() {
  // updates the background color of historical charts
  var updateHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));

  // updates the background color of gauge charts
  var gaugeHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  gaugeCharts.forEach((chart) => Plotly.relayout(chart, gaugeHistory));
}

const mediaQuery = window.matchMedia("(max-width: 600px)");

mediaQuery.addEventListener("change", function (e) {
  handleDeviceChange(e);
});

function handleDeviceChange(e) { //this function is for the movile
  if (e.matches) {
    console.log("Inside Mobile");
    var updateHistory = {
      width: 323,
      height: 250,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  } else {
    var updateHistory = {
      width: 550,
      height: 260,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  }
}

/*
  MQTT Message Handling Code
*/
const mqttStatus = document.querySelector(".status");

function onConnect(message) {
  mqttStatus.textContent = "Connected";
}
function onMessage(topic, message) {
  var stringResponse = message.toString();
  //console.log(stringResponse)
  var messageResponse = JSON.parse(stringResponse);
  //updateSensorReadings(messageResponse); //send number
  //console.log(topic)//IDENTIFICA EL TOPIC
  if(topic == 'vol_dash'){
     updateSensorReadings(messageResponse); //send number 
  }
  else if (topic == 'current_dash') {
     updateSensorReadings00(messageResponse);
  }

  else if(topic == 'power_dash'){
     updateSensorReadings02(messageResponse);
  }
  else if (topic =='volt_int') {
     chart_00(messageResponse);
  }
  else if(topic == 'cur_int'){
     chart_01(messageResponse);
  }
  else if(topic == 'power_int'){
     chart_02(messageResponse);
  }
}

function onError(error) {
  console.log(`Error encountered :: ${error}`);
  mqttStatus.textContent = "Error";
}

function onClose() {
  console.log(`MQTT connection closed!`);
  mqttStatus.textContent = "Closed";
}

function fetchMQTTConnection() {
  fetch("/mqttConnDetails", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      initializeMQTTConnection(data.mqttServer, data.mqttTopic,data.mqttTopic_1,data.mqttTopic_2,data.mqttTopic_3,data.mqttTopic_4,data.mqttTopic_5);
    })
    .catch((error) => console.error("Error getting MQTT Connection :", error));
}
function initializeMQTTConnection(mqttServer,mqttTopic,mqttTopic_1,mqttTopic_2,mqttTopic_3,mqttTopic_4,mqttTopic_5) {
  //topícos we
  console.log(
    `Initializing connection to :: ${mqttServer}, volt_0 :: ${mqttTopic},current_0::${mqttTopic_1}
                                  ,power_0::${mqttTopic_2},volt_inst::${mqttTopic_3},curr_inst::${mqttTopic_4}
                                  ,power_inst::${mqttTopic_5}`
  );
  var fnCallbacks = { onConnect, onMessage, onError, onClose };

  var mqttService = new MQTTService(mqttServer, fnCallbacks);
  mqttService.connect();

  mqttService.subscribe(mqttTopic);
  mqttService.subscribe(mqttTopic_1);
  mqttService.subscribe(mqttTopic_2);
  mqttService.subscribe(mqttTopic_3);
  mqttService.subscribe(mqttTopic_4);
  mqttService.subscribe(mqttTopic_5);
}
