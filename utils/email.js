const nodemailer = require('nodemailer');

const sendMail = async options => {

    // 1) CREATE A TRANSPORTER
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // 2) DEFINE THE EMAIL OPTIONS
    const mailOptions = {
        from: 'Danio Test <danio.test@test.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    // 3) SEND THE EMAIL
    await transporter.sendMail(mailOptions);
}

module.exports = sendMail;