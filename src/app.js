const express = require('express');
const app = express();
app.use(express.json());

const User = require('../src/user/User');

app.post('/api/1.0/users', (req, res) => {
  User.create(req.body).then(() => {
    return res.send({ message: 'User created' });
  });
});

module.exports = app;
