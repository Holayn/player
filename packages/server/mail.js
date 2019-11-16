const {PubSub} = require('@google-cloud/pubsub');
const {google} = require('googleapis');
const bufferFrom = require('buffer-from');

const client = require('./google/auth');
const {playMusicHandler} = require('./actions');


async function receiveMail(player) {
  const pubsub = new PubSub();
  const subscription = pubsub.subscription('projects/gcloud-server-v1/subscriptions/inbox-change');

  let latestHistoryId;

  // get list of messages
  // most recent message's historyId and store that
  // on subscription receive message, use historyId to get new message
  // set new historyId in store
  const messages = await client.executeAPI(_getMessages);
  const msgId = messages[0].id;
  const message = await client.executeAPI(_getMessage.bind(null, msgId));
  latestHistoryId = message.historyId;
  

  subscription.on('message', async (msg) => {
    console.log(`Received message ${msg.id}`);
    const json = bufferFrom(msg.data, 'base64').toString('ascii');
    const obj = await JSON.parse(json);
    console.log(obj);

    const historyId = obj.historyId;
    
    const history = await client.executeAPI(_history.bind(null, latestHistoryId));
    if (history && history[0]) {
      const msgId = history[0].messages[0].id;
      const message = await client.executeAPI(_getMessage.bind(null, msgId));
      const subjectObj = message && message.payload && message.payload.headers.filter((header) => {
        return header.name === 'Subject';
      });
      console.log(subjectObj)
      const subject = subjectObj && subjectObj[0] && subjectObj[0].value;

      // do something here
      playMusicHandler(player, subject);
    }

    // update latest history id
    latestHistoryId = historyId;

    msg.ack();
  })
}

async function _getMessages(auth) {
  return new Promise(async (res, rej) => {
    const gmail = google.gmail({version: 'v1', auth});
    const messagesRes = await gmail.users.messages.list({
      userId: 'me',
    }).catch((err) => {
      console.error('error with intial messages fetch: ' + err);
      rej();
    });
    if (messagesRes) {
      console.log('messages data:');
      console.log(messagesRes.data && messagesRes.data.messages);
      res(messagesRes.data && messagesRes.data.messages);
    }
  });
}

async function _getMessage(id, auth) {
  return new Promise(async (res, rej) => {
    const gmail = google.gmail({version: 'v1', auth});
    const messageRes = await gmail.users.messages.get({
      userId: 'me',
      id: id,
    }).catch((err) => {
      console.error('error with message fetch: ' + err);
      rej();
    });
    if (messageRes) {
      console.log('message data:');
      console.log(messageRes.data && messageRes.data.id);
      res(messageRes.data);
    }
  })
}

async function _history(startHistoryId, auth) {
  return new Promise(async (res, rej) => {
    const gmail = google.gmail({version: 'v1', auth});
    const historyRes = await gmail.users.history.list({
      userId: 'me',
      startHistoryId,
    }).catch((err) => {
      console.error('error with history list fetch: ' + err);
      rej();
    });
    if (historyRes) {
      console.log('history list data:');
      console.log(historyRes.data);
      res(historyRes.data && historyRes.data.history);
    }
  });
}

module.exports = {
  receiveMail,
}