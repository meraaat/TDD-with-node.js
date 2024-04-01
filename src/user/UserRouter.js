const UserService = require('./UserService');

const express = require('express');
const router = express.Router();

const validationUsername = (req, res, next) => {
  const user = req.body;

  if (user.username === null) {
    req.ValidationError = {
      username: 'username cannot be null',
    };
  }
  next();
};

const validationEmail = (req, res, next) => {
  const user = req.body;

  if (user.email === null) {
    req.ValidationError = {
      ...req.ValidationError,
      email: 'email cannot be null',
    };
  }
  next();
};

router.post('/api/1.0/users', validationUsername, validationEmail, async (req, res) => {
  if (req.ValidationError) {
    const response = { validationError: { ...req.ValidationError } };
    return res.status(400).send(response);
  }

  await UserService.save(req.body);
  return res.send({ message: 'User created' });
});

module.exports = router;
