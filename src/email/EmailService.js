const transporter = require('../config/emailTransporter');

const accountActivation = async (email, token) => {
  await transporter.sendMail({
    from: 'MerAt App <info@merat-app.com>',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${token}`,
  });
};

module.exports = { accountActivation };
