const mongoose = require('mongoose');

require('dotenv').config();

const url = process.env.DB_URL;
const options = {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const TrackSchema = new mongoose.Schema({
  url: {
    type: String,
  },
});

const Track = mongoose.model('Track', TrackSchema);

class DB {

  async connect() {
    try {
      this.connection = await mongoose.connect(url, options);
    } catch (e) {
      console.log('something went wrong trying to connect to the db: ' + e);
    }
  }

  async getTracks() {
    try {
      if (!this.connection) {
        await this.connect();
      }

      var query = Track.find({});
      const tracksRes = await query.exec();

      return tracksRes.map((track) => {
        return track.url;
      });
    } catch (e) {
      console.log('something went wrong with fetching tracks: ' + e);
    }
  }

}

module.exports = DB;
