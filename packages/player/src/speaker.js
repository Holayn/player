const Spkr = require('speaker');
const ytdl = require('ytdl-core');
const Stream = require('stream');
const FFmpeg = require("fluent-ffmpeg");
const decoder = require('lame').Decoder;
const Volume = require('pcm-volume');

module.exports = class Speaker {
  constructor() {
    this.decoded_stream = null;
    this.audio_stream = null;
    this.speaker = null;
    this.currentVolume = 1;
  }

  init() {}

  stop() {
    return this._destroy();
  }

  async play(url, retry = false) {
    try {
      this._createSpeaker();
      this.audio = ytdl(url, {
        audioFormat: 'mp3',
      });
      const ffmpeg = new FFmpeg(this.audio);
  
      let stream = new Stream.PassThrough();
      
      ffmpeg.format('mp3').on('error', (err, stdout, stderr) => {
        setTimeout(() => {
          console.log('something went wrong, retrying...');
          this.play(url);
          return;
        }, 3000);
      }).pipe(stream)
  
      this.decoded_stream = stream.pipe(decoder({
        channels: 2,
        bitDepth: 16,
        sampleRate: 44100,
      }));
      this.audio_stream = this.decoded_stream.pipe(this.volume);
      this.current_stream = this.audio_stream.pipe(this.speaker);
  
      console.info('play');
  
      return new Promise((resolve) => {
        this.current_stream.on('close', () => {
          console.info('finished playing track');
          resolve();
        });
      });
    } catch (e) {
      console.log(e);
      if (!retry) {
        setTimeout(function() {
          this.play(url, true);
        }, 3000);
      }
    }
  }

  pause() {
    this.audio_stream.unpipe(this.speaker);
  }

  resume() {
    this.audio_stream.pipe(this.speaker);
  }

  adjustVolume(volume) {
    this.currentVolume = volume;
    this.volume.setVolume(volume);
  }

  _createSpeaker() {
    console.log('_createSpeaker(): creating new speaker');
    this.speaker = new Spkr({
      channels: 2,
      bitDepth: 16,
      sampleRate: 44100,
    });
    this.volume = new Volume();
    this.volume.setVolume(this.currentVolume);    
 }

  _closeAllListeners() {
    if (this.audio_stream) {
      this.audio_stream.removeAllListeners('close');
    }
  }

  _closeStreams() {
    this._closeAllListeners();
    return new Promise((resolve) => {
      if (!this.current_stream || !this.decoded_stream) {
        resolve();
        return;
      }
      this.current_stream.on('close', () => {
        console.info('closing current_stream');
        this.current_stream = null;
        resolve();
      });

      this.decoded_stream.unpipe(this.speaker).end();
      this.audio.destroy();
    });
  }

  _destroy() {
    return new Promise((resolve) => {
      this._closeStreams().then(() => {
        resolve();
      });
    });
  }
}
