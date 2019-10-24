const Speaker = require('speaker');
const ytdl = require('ytdl-core');
const Stream = require('stream');
const FFmpeg = require("fluent-ffmpeg");
const decoder = require('lame').Decoder;
const ytpl = require('ytpl');

module.exports = class Player {
  constructor() {
    this.isPlaying = false;
    this.decoded_stream = null;
    this.audio_stream = null;

    this.queue = [];
  }

  get playing() {
    return this.isPlaying;
  }

  load(url) {
    if (!this.playing && this.queue.length === 0) {
      this._play(url)
      return;
    }

    this.queue.push(url);
  }

  _play(url) {
    this._createSpeaker();

    const audio = ytdl(url, {
      audioFormat: 'mp3',
    });
    const ffmpeg = new FFmpeg(audio);

    let stream = new Stream.PassThrough();

    ffmpeg.format('mp3').on('error', (err, stdout, stderr) => {
      setTimeout(() => {
        console.log('something went wrong, retrying...');
        this.speaker.close();
        this._play(url);
        return;
      }, 3000);
    }).pipe(stream)

    this.decoded_stream = stream.pipe(decoder());
    this.audio_stream = this.decoded_stream.pipe(this.speaker);

    this.isPlaying = true;

    this.audio_stream.on('close', () => {
      console.info('finished playing track');
      this._next();
    });

    console.info('play')
  }

  pause() {
    this.isPlaying = false;
    this.decoded_stream.unpipe(this.speaker);
  }

  resume() {
    this.isPlaying = true;
    this.decoded_stream.pipe(this.speaker);
  }

  stop() {
    this.isPlaying = false;
    this.decoded_stream.unpipe(this.speaker).end();
    this.audio_stream.destroy();
    this.speaker.close();
  }

  _next() {
    this._closeAllListeners();

    const next = this.queue.shift();
    if (next) {
      console.info('playing next track');
      this._play(next);
    }
  }

  skip() {
    this._closeAllListeners();

    if (!this.playing) {
      throw new Error('nothing to skip');
    }

    this.audio_stream.on('close', () => {
      console.info('playing stopped');
    });

    this.speaker.on('close',  () => {
      console.info('closing speaker');
      this._next();
    });

    this.stop();
  }

  playlist(url) {
    ytpl(url, (err, playlist) => {
      if (err) {
        console.error(err);
        return;
      }
      
      const canPlay = this.queue.length === 0;
      const items = playlist.items;
      items.forEach((vid) => {
        const link  = vid.url_simple;
        this.queue.push(link);
      });

      if (canPlay) {
        this._next();
      }

    });
  }

  _createSpeaker() {
    this.speaker = new Speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: 44100,
    });
  }

  _closeAllListeners() {
    if (this.playing) {
      this.audio_stream.removeAllListeners('close');
    }
  }
}
