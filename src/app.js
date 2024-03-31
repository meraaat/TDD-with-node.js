const express = require('express');
const app = express();

const User = require('../src/user/User');

app.post('/app/1.0/users', (req, res) => {
  User.create(req.body).then(() => {
    return res.send({ message: 'User created' });
  });
});

module.exports = app;
