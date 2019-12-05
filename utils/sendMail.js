const nodemailer = require('nodemailer');
const { ADMIN_EMAIL, ADMIN_EMAIL_PASSWORD } = require('../constants/credentials');

async function sendMail ({ senderAcount, text, html, target }) {
  // const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ADMIN_EMAIL, // generated ethereal user
      pass: ADMIN_EMAIL_PASSWORD // generated ethereal password
    }
  });

  try {
    const info = await transporter.sendMail({
      from: "'Fred Foo 👻' <foo@example.com>", // sender address
      to: `${target}`, // list of receivers
      subject: 'Authorizatoin Email Confirmation', // Subject line
      text, // plain text body
      html: `<b>${text}</b>` // html body
    });
    console.log('\n-------- send mail --------\n')
    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    console.log('\n-------- ---------- --------\n')

    // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: ttps://ethereal.email/message/WaQKMgKddxQDoou.
  } catch (e) {
    console.log('e: ', e);
  }
};

// sendMail({ text: 'test', target: 'allents0927@gmail.com' });

module.exports = sendMail;
