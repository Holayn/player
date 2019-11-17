const express = require('express');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const bodyParser = require('body-parser');

const Player = require('player');
const {receiveMail} = require('./mail');

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

app.post('/load', async (req, res) => {
  const url = req.body && req.body.url;
  try {
    await player.load(url);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
    return;
  }
});

app.post('/playlist', async (req, res) => {
  const url = req.body && req.body.url;
  try {
    await player.playlist(url);
  } catch (e) {
    res.status(500).send(e);
  }

  res.sendStatus(200);
})

app.post('/pause', (req, res) => {
  player.pause();
  res.sendStatus(200);
});

app.post('/resume', (req, res) => {
  player.resume();
  res.sendStatus(200);
});

app.post('/stop', (req, res) => {
  player.stop();
  res.sendStatus(200);
});

app.get('/now-playing', async (req, res) => {
  const track = player.getNowPlaying();
  if (!track) {
    res.sendStatus(204);
    return;
  }
  res.status(200).send(track);
});

app.get('/queue', async (req, res) => {
  const queue = player.getQueue();
  res.status(200).send(queue);
})

app.post('/next', (req, res) => {
  player.skip();

  res.sendStatus(200);
})

app.post('/adjustVolume', (req, res) => {
  const vol = req.body && req.body.volume;
  player.adjustVolume(vol);

  res.sendStatus(200);
})

function init() {
  player = new Player();

  receiveMail(player);
}
