const DB = require('./db');

const db = new DB();

const MAIL_MATCHES = [/Ring Alarm is Disarmed/g];

async function playMusicHandler(player, subject) {
  if (subject.match(MAIL_MATCHES[0])) {
    const tracks = await db.getTracks();

    for(let i=0; i<tracks.length; i++) {
      let rand = Math.floor(Math.random() * tracks.length-(i+1)) + (i+1);
      let temp = tracks[i];
      tracks[i] = tracks[rand];
      tracks[rand] = temp;
    }

    tracks.forEach(async (track) => {
      await player.load(track);
    });
  }
}

module.exports = {
  playMusicHandler,
}