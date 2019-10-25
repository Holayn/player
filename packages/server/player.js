const ytpl = require('ytpl');

const Speaker = require('./speaker');

module.exports = class Player {
  constructor() {
    this.isPlaying = false;
    this.speaker = new Speaker();

    this.queue = [];
  }

  load(url) {
    if (!this.isPlaying && this.queue.length === 0) {
      this._play(url)
      return;
    }

    this.queue.push(url);
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
    this.isPlaying = false;
    this.speaker.stop();
  }

  skip() {
    if (!this.isPlaying) {
      return;
    }

    this.speaker.stop().then(() => {
      this.isPlaying = false;
      this._next();
    });
  }

  async _play(url) {
    this.isPlaying = true;

    await this.speaker.play(url);

    if (this.queue.length > 0) {
      this._next();
    }
  }

  _next() {
    const next = this.queue.shift();
    if (next) {
      console.info('playing next track');
      this._play(next);
    }
  }
}
