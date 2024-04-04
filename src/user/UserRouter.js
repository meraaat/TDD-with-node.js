const UserService = require('./UserService');

const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('username cannot be null')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('username must min 4 and max 32 characters'),
  check('email')
    .notEmpty()
    .withMessage('E-mail cannot be null')
    .bail()
    .isEmail()
    .withMessage('E-mail is not valid')
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) throw new Error('E-mail is in use');
    }),
  check('password')
    .notEmpty()
    .withMessage('password cannot be null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('password must have at least 1 uppercase, 1 lowercase letter and 1 number'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationError = {};
      errors.array().forEach((error) => (validationError[error.path] = error.msg));
      console.log(`errrrrror : ${Object.keys(validationError)}, ${Object.values(validationError)}`);
      return res.status(400).send({ validationError });
    }

    await UserService.save(req.body);
    return res.send({ message: 'User created' });
  },
);

module.exports = router;
