const DB = require('./db');

const db = new DB();

const MAIL_MATCHES = [/Ring Alarm is Disarmed/g];

async function playMusicHandler(player, subject) {
  if (subject.match(MAIL_MATCHES[0])) {
    const tracks = await db.getTracks();

    const index = Math.floor(Math.random() * Math.floor(tracks.length-1));
    player.load(tracks[index]);
  }
}

module.exports = {
  playMusicHandler,
}