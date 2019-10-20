const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.listen(80, () => {
  console.info('Listening on 80');
});