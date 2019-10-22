const Speaker = require('speaker');
const ytdl = require('ytdl-core');
const Stream = require('stream');
const FFmpeg = require("fluent-ffmpeg");
const decoder = require('lame').Decoder;

module.exports = class Player {
  constructor() {
    this.isPlaying = false;
    this.decoded_stream = null;
    this.audio_stream = null;
  }

  play(url) {
    this._createSpeaker();

    if (this.isPlaying) {
      this.changeTrack(url);
      return;
    }

    const audio = ytdl(url, {
      audioFormat: 'mp3',
    });
    const ffmpeg = new FFmpeg(audio);

    let stream = new Stream.PassThrough();

    ffmpeg.format('mp3').on('error', (err, stdout, stderr) => {
      setTimeout(() => {
        console.log('something went wrong');
        this.speaker.close();
        return;
      }, 3000);
    }).pipe(stream)

    this.decoded_stream = stream.pipe(decoder());
    this.audio_stream = this.decoded_stream.pipe(this.speaker);

    this.isPlaying = true;
    
    console.info('play')
  }

  pause() {
    this.decoded_stream.unpipe(this.speaker);
    this.isPlaying = false;
  }

  resume() {
    this.decoded_stream.pipe(this.speaker);
    this.isPlaying = true;
  }

  stop() {
    this.decoded_stream.unpipe(this.speaker).end();
    this.audio_stream.destroy();
    this.speaker.close();
  }

  changeTrack(url) {
    this.isPlaying = false;

    this.audio_stream.on('close', () => {
      console.info('playing stopped');
      this.play(url);
    });

    this.speaker.on('close',  () => {
      console.info('closing speaker');
    });

    this.stop();
  }

  _createSpeaker() {
    this.speaker = new Speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: 44100,
    });
  }
}