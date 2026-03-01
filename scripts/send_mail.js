const googleManager = require('../src/lib/google');
const logger = require('../src/config/logger');

async function main() {
    const [recipient, subject, body] = process.argv.slice(2);
    
    if (!recipient || !subject || !body) {
        console.error('Usage: node send_mail.js <recipient> <subject> <body>');
        process.exit(1);
    }

    try {
        await googleManager.init();
        await googleManager.sendEmail(recipient, subject, body);
        console.log('Email sent successfully');
        process.exit(0);
    } catch (error) {
        console.error('Failed to send email:', error);
        process.exit(1);
    }
}

main();
