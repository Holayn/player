const Spkr = require('speaker');
const ytdl = require('ytdl-core');
const Stream = require('stream');
const FFmpeg = require("fluent-ffmpeg");
const decoder = require('lame').Decoder;

module.exports = class Speaker {
  constructor() {
    this.decoded_stream = null;
    this.audio_stream = null;
  }

  init() {
    this._createSpeaker();
  }

  stop() {
    return this._destroy();
  }

  async play(url) {
    if (this.speaker) {
      this._closeSpeaker();
    }
    this.init();

    const audio = ytdl(url, {
      audioFormat: 'mp3',
    });
    const ffmpeg = new FFmpeg(audio);

    let stream = new Stream.PassThrough();

    ffmpeg.format('mp3').on('error', (err, stdout, stderr) => {
      setTimeout(() => {
        console.log('something went wrong, retrying...');
        this.play(url);
        return;
      }, 3000);
    }).pipe(stream)

    this.decoded_stream = stream.pipe(decoder());
    this.audio_stream = this.decoded_stream.pipe(this.speaker);

    console.info('play');

    return new Promise((resolve) => {
      this.audio_stream.on('close', () => {
        console.info('finished playing track');
        resolve();
      });
    });
  }

  pause() {
    this.decoded_stream.unpipe(this.speaker);
  }

  resume() {
    this.decoded_stream.pipe(this.speaker);
  }

  _createSpeaker() {
    this.speaker = new Spkr({
      channels: 1,
      bitDepth: 16,
      sampleRate: 44100,
    });
  }

  _closeAllListeners() {
    if (this.audio_stream) {
      this.audio_stream.removeAllListeners('close');
    }
  }

  _closeSpeaker() {
    return new Promise((resolve) => {
      if (!this.speaker) {
        resolve();
        return;
      }
      this.speaker.on('close', () => {
        console.info('closing speaker');
        this.speaker = null;
        resolve();
      });

      this.speaker.close();
    });
  }

  _closeStreams() {
    this._closeAllListeners();
    return new Promise((resolve) => {
      if (!this.audio_stream || !this.decoded_stream) {
        resolve();
        return;
      }
      this.audio_stream.on('close', () => {
        console.info('closing audio stream');
        this.audio_stream = null;
        resolve();
      });

      this.decoded_stream.unpipe(this.speaker).end();
      this.audio_stream.destroy();
    });
  }

  _destroy() {
    return this._closeSpeaker().then(() => {
      return this._closeStreams();
    })
  }
}