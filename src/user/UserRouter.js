const UserService = require('./UserService');

const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();

router.post(
  '/api/1.0/users',
  check('username').notEmpty().withMessage('username cannot be null'),
  check('email').notEmpty().withMessage('email cannot be null'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationError = {};
      errors.array().forEach((error) => (validationError[error.path] = error.msg));
      return res.status(400).send({ validationError });
    }

    await UserService.save(req.body);
    return res.send({ message: 'User created' });
  },
);

module.exports = router;
