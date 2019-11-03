const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

const Speaker = require('./speaker');

class Track {
  constructor(url) {
    this.url = url;
    this.name = '';
  }

  async getInfo() {
    const info = await ytdl.getInfo(this.url);
    this.name = info.title;
  }
}

module.exports = class Player {
  constructor() {
    // state
    this.isPlaying = false;
    this.nowPlaying = null;
    
    this.speaker = new Speaker();
    this.queue = [];
  }

  getNowPlaying() {
    return this.nowPlaying;
  }

  getQueue() {
    return this.queue;
  }

  async load(url) {
    const track = new Track(url);
    await track.getInfo();
    if (!this.isPlaying && this.queue.length === 0) {
      this._play(track);
      return;
    }

    this.queue.push(track);
  }

  playlist(url) {
    return new Promise((resolve, reject) => {
      ytpl(url, (err, playlist) => {
        if (err) {
          console.error(err);
          reject();
          return;
        }
        
        const canPlay = this.queue.length === 0;
        const items = playlist.items;
        items.forEach((vid) => {
          const link  = vid.url_simple;
          const track = new Track(link);
          track.name = vid.title;
          this.queue.push(track);
        });
  
        if (canPlay) {
          this._next();
        }

        resolve();
      });
    });
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }
    this.isPlaying = false;
    this.speaker.pause();
  }

  resume() {
    if (this.isPlaying) {
      return;
    }
    this.isPlaying = true;
    this.speaker.resume();
  }

  stop() {
    if (!this.isPlaying) {
      return;
    }
    console.info('stopping player');
    this.nowPlaying = null;
    this.isPlaying = false;
    this.speaker.stop();
  }

  skip() {
    if (!this.nowPlaying) {
      throw new Error('nothing playing');
    }

    this.speaker.stop().then(() => {
      this.isPlaying = false;
      this.nowPlaying = null;
      this._next();
    });
  }

  async _play(track) {
    console.info('playing track: ' + track.name);
    this.isPlaying = true;
    this.nowPlaying = track;

    try {
      await this.speaker.play(track.url);
    } catch (e) {
      return e;
    }


    if (this.queue.length > 0) {
      this._next();
    } else {
      this.stop();
    }
  }

  _next() {
    const nextTrack = this.queue.shift();
    if (nextTrack) {
      this._play(nextTrack);
    }
  }
}
