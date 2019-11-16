function playMusicHandler(player, subject) {
  if (subject.match(/play some music/g)) {
    player.load('https://www.youtube.com/watch?v=ruZ1F4NYWJg');
  }
}

module.exports = {
  playMusicHandler,
}