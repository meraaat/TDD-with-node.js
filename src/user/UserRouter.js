const UserService = require('./UserService');

const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();

router.post(
  '/api/1.0/users',
  check('username').notEmpty().withMessage('username_null').bail().isLength({ min: 4, max: 32 }).withMessage('username_size'),
  check('email')
    .notEmpty()
    .withMessage('email_null')
    .bail()
    .isEmail()
    .withMessage('email_invalid')
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) throw new Error('email_inuse');
    }),
  check('password')
    .notEmpty()
    .withMessage('password_null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('password_size')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('password_pattern'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationError = {};
      errors.array().forEach((error) => (validationError[error.path] = req.t(error.msg)));
      return res.status(400).send({ validationError });
    }

    await UserService.save(req.body);
    return res.send({ message: req.t('user_created') });
  },
);

module.exports = router;
