const express = require('express');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const bodyParser = require('body-parser');

const ytdl = require('ytdl-core');
const Stream = require('stream');
const FFmpeg = require("fluent-ffmpeg");
const decoder = require('lame').Decoder
const Speaker = require('speaker')

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
});


app.post('/play', (req, res) => {
  const url = req.body && req.body.url;

  const audio = ytdl(url, {
    audioFormat: 'mp3',
  });

  const spkr = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 44100,
  });

  const ffmpeg = new FFmpeg(audio);

  const stream = new Stream.PassThrough();

  ffmpeg.format('mp3').pipe(stream);
  stream.pipe(decoder())
  .pipe(spkr);

  res.sendStatus(200);
});

app.post('/stop', (req, res) => {
  // decodedStream.unpipe(player.speaker).end();
  res.sendStatus(200);
});
