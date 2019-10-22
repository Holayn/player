const express = require('express');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const bodyParser = require('body-parser');

const Player = require('./player');


const app = express();
app.use(cors());
app.use(bodyParser.json());

let player;

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}", 
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

app.listen(80, () => {
  console.info('Listening on 80');
  init();
});

app.post('/play', (req, res) => {
  const url = req.body && req.body.url;
  player.play(url);

  res.sendStatus(200);
});

app.post('/stop', (req, res) => {
  player.pause();
  res.sendStatus(200);
});

app.post('/resume', (req, res) => {
  player.resume();
  res.sendStatus(200);
});

function init() {
  player = new Player();
}
