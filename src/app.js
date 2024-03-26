const express = require('express');
const app = express();

app.post('/app/1.0/users', (req, res) => {
  return res.send({ message: 'User created' });
});

module.exports = app;
