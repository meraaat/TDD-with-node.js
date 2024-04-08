const nodemailer = require('nodemailer');
const nodemailerStub = require('nodemailer-stub');

const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);

const accountActivation = async (email, token) => {
  await transporter.sendMail({
    from: 'MerAt App <info@merat-app.com>',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${token}`,
  });
};

module.exports = { accountActivation };
