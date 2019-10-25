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

app.listen(8000, () => {
  console.info('Listening on 8000');
  init();
});

app.post('/load', (req, res) => {
  const url = req.body && req.body.url;
  player.load(url);

  res.sendStatus(200);
});

app.post('/playlist', (req, res) => {
  const url = req.body && req.body.url;
  player.playlist(url);

  res.sendStatus(200);
})

app.post('/stop', (req, res) => {
  player.pause();
  res.sendStatus(200);
});

app.post('/resume', (req, res) => {
  player.resume();
  res.sendStatus(200);
});

app.get('/now-playing', async (req, res) => {
  const trackInfo = await player.getNowPlaying();
  res.status(200).send({
    title: trackInfo && trackInfo.title,
    info: trackInfo,
  });
});

app.get('/queue', async (req, res) => {})

app.post('/next', (req, res) => {
  try {
    player.skip();
  } catch (e) {
    console.error(e);
    // res.statusMessage = e;
    // res.sendStatus(405);
  }

  res.sendStatus(200);
})

function init() {
  player = new Player();
}
