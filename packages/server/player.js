const Speaker = require('speaker');
const ytdl = require('ytdl-core');
const Stream = require('stream');
const FFmpeg = require("fluent-ffmpeg");
const decoder = require('lame').Decoder;

module.exports = class Player {
  constructor() {
    this._createSpeaker();
    this.isPlaying = false;
    this.decoded_stream = null;
    this.audio_stream = null;
  }

  play(url) {
    if (this.isPlaying) {
      this.changeTrack(url);
    }

    const audio = ytdl(url, {
      audioFormat: 'mp3',
    });
  
    const ffmpeg = new FFmpeg(audio);
  
    this.isPlaying = true;
  
    // ffmpeg.format('mp3').pipe(this.decoded_stream);
    // this.decoded_stream.pipe(decoder())
    // .pipe(this.speaker);

    let stream = new Stream.PassThrough();

    ffmpeg.format('mp3').pipe(stream);
    this.decoded_stream = stream.pipe(decoder());
    this.audio_stream = this.decoded_stream.pipe(this.speaker);

    this.audio_stream.on('end', () => {
      this.decoded_stream.unpipe(this.speaker).end();
    });
    this.audio_stream.on('close', () => {
      this.decoded_stream.unpipe(this.speaker).end();
    });
  }

  pause() {
    this.decoded_stream.unpipe(this.speaker);
    this.decoded_stream.on('unpipe', () => {
      console.log('unpipe');
    });
    this.decoded_stream.on('end', () => {
      console.log('end');
    });
    this.decoded_stream.on('close', () => {
      console.log('close');
    });
    this.decoded_stream.on('finish', () => {
      console.log('finish');
    });
    this.isPlaying = false;
  }

  resume() {
    this.decoded_stream.pipe(this.speaker);
    this.isPlaying = true;
  }

  changeTrack(url) {
    this.stop();
    this.stream.on('end', () => {
      console.log('end');
      this.isPlaying = false;
      this.play(url);
    });
  }

  _createSpeaker() {
    this.speaker = new Speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: 44100,
    });
  }
}