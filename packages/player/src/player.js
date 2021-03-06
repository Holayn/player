const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

const Speaker = require('./speaker');

class Track {
  constructor(url) {
    this.url = url;
    this.name = '';
  }

  async getInfo() {
    try {
      const info = await ytdl.getInfo(this.url);
      this.name = info.title;
    } catch (e) {
      console.log('getInfo(): error');
      console.log(e);
    }
  }
}

module.exports = class Player {
  constructor() {
    // state
    this.isPlaying = false;
    this.nowPlaying = null;
    
    this.speaker = new Speaker();
    this.speaker.init();

    this.queue = [];
  }

  getNowPlaying() {
    return this.nowPlaying;
  }

  getQueue() {
    return this.queue;
  }

  async load(url) {
    console.log('load track: ' + url);
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
	  console.log(`playlist(url): adding ${track} to queue`);
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
    this.queue = [];
    this.speaker.stop();
  }

  skip() {
    if (!this.nowPlaying) {
      return;
    }

    this.speaker.stop().then(() => {
      this.isPlaying = false;
      this.nowPlaying = null;
    });
  }

  adjustVolume(volume) {
    if (this.speaker) {
      this.speaker.adjustVolume(volume);
    }
  }

  async _play(track, retry = false) {
    console.info('playing track: ' + track.name);
    this.isPlaying = true;
    this.nowPlaying = track;

    try {
      await this.speaker.play(track.url);
    } catch (e) {
      console.error(e);
      // try again in a few seconds
      if (!retry) {
        setTimeout(function() {
          this._play(track, true);
        }, 3000);
      }
    }


    if (this.queue.length > 0) {
      this._next();
    } else {
      this.stop();
    }
  }

  _next() {
    if (this.queue.length === 0) {
      return;
    }
    const nextTrack = this.queue.shift();
    if (nextTrack) {
      this._play(nextTrack);
    }
  }
}
