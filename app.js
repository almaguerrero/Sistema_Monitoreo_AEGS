const express = require("express");
const app = express();
const port = 3000;

// load dotenv to read environment variables
require("dotenv").config();

// template view engine
app.set("view engine", "ejs");

// Serve Static Files
app.use(express.static("public"));

//routes
const dashboardRouter = require("./routes/dashboard");

app.get("/mqttConnDetails", (req, res) => {
  res.send(
    JSON.stringify({
      mqttServer: process.env.MQTT_BROKER,
      mqttTopic: process.env.MQTT_TOPIC,
      mqttTopic_1: process.env.MQTT_TOPIC_1,
      mqttTopic_2: process.env.MQTT_TOPIC_2,
      mqttTopic_3: process.env.MQTT_TOPIC_3,
      mqttTopic_4: process.env.MQTT_TOPIC_4,
      mqttTopic_5: process.env.MQTT_TOPIC_5,
    })
  );
});

app.get("/", dashboardRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
