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
  try {
    const messages = await client.executeAPI(_getMessages);
    const msgId = messages[0].id;
    const message = await client.executeAPI(_getMessage.bind(null, msgId));
    console.log('setting latest history id: ' + message.historyId);
    latestHistoryId = message.historyId;
  } catch(e) {
    console.log(e);
  }
  

  subscription.on('message', async (msg) => {
    console.log(`Received message ${msg.id}`);
    const json = bufferFrom(msg.data, 'base64').toString('ascii');
    const obj = await JSON.parse(json);
    console.log(obj);

    const historyId = obj.historyId;
    
    try {
      const history = await client.executeAPI(_history.bind(null, latestHistoryId));
      if (history && history.length) {
        // look for messages added
        const messagesAdded = history.filter((message) => {
          return message.messagesAdded;
        })

        messagesAdded.forEach(async (message) => {
          try {
            const msgId = message.messagesAdded[0].message.id;
            const messageRes = await client.executeAPI(_getMessage.bind(null, msgId));
            const subjectObj = messageRes && messageRes.payload && messageRes.payload.headers.filter((header) => {
              return header.name === 'Subject';
            });
            console.log(subjectObj)
            const subject = subjectObj && subjectObj[0] && subjectObj[0].value;

            // do something here
            playMusicHandler(player, subject);
          } catch (e) {
            console.log('something went wrong');
          }
        })
      }

      // update latest history id
      console.log('setting latest history id: ' + historyId);
      latestHistoryId = historyId;
    } catch(e) {
      console.log('failed to process message');
    }

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