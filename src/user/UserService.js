const bcrypt = require('bcrypt');
const User = require('./User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const nodemailerStub = require('nodemailer-stub');

const generateToken = (length) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

const save = async (body) => {
  const { username, email, password } = body;
  const hash = await bcrypt.hash(password, 10);
  const user = { username, email, password: hash, activationToken: generateToken(16) };

  const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);
  await transporter.sendMail({
    from: 'MerAt App <info@merat-app.com>',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${user.activationToken}`,
  });

  await User.create(user);
};

const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

module.exports = { save, findByEmail };
