const DB = require('./db');

const db = new DB();

const DISARMED = /Ring Alarm is Disarmed/g;
const ARMED = /Ring Alarm is in Home Mode|Ring Alarm is in Away Mode/g;

async function playMusicHandler(player, subject) {
  if (player.isPlaying) {
    if (subject.match(ARMED)) {
      player.stop();
    }
  } else {
    if (subject.match(DISARMED)) {
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
}

module.exports = {
  playMusicHandler,
}