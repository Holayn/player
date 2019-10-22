const Speaker = require('speaker');
const ytdl = require('ytdl-core');
const Stream = require('stream');
const FFmpeg = require("fluent-ffmpeg");
const decoder = require('lame').Decoder;

module.exports = class Player {
  constructor() {
    _createSpeaker();
  }

  play(url) {
    const audio = ytdl(url, {
      audioFormat: 'mp3',
    });
  
    const ffmpeg = new FFmpeg(audio);
  
    this.stream = new Stream.PassThrough();
  
    ffmpeg.format('mp3').pipe(this.stream);
    this.stream.pipe(decoder())
    .pipe(this.speaker);
  }

  stop() {
    this.stream.unpipe(this.speaker).end();
    this.stream.end();
    this.speaker.destroy();
    _createSpeaker();
  }

  _createSpeaker() {
    this.speaker = new Speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: 44100,
    });
  }
}