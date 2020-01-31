const { getCredentials } = require('../utils');
const { SNED_GRID_APIKEY } = getCredentials();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SNED_GRID_APIKEY);

const sendMail = ({
  authUrl,
  target
}) => {
  const msg = {
    to: `${target}`,
    from: 'hanyulo.official@gmail.com',
    subject: 'Authorizatoin Email Confirmation',
    text: authUrl,
    html: `<b>${authUrl}</b>`
  };
  sgMail.send(msg);
};

module.exports = sendMail;
