const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('\n🧪 Email Configuration Test\n');
console.log('Config:');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.substring(12) : 'NOT SET'}`);

async function test() {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('\n⏳ Testing connection...');
    
    // Verify
    await transporter.verify();
    console.log('✅ Email connection verified!\n');

    // Send test
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,  // Send to self for testing
      subject: '🧪 Test Email - Concert Ticket System',
      html: `
        <h2>Test Email Successful! ✅</h2>
        <p>Your email configuration is working correctly.</p>
        <p><strong>To:</strong> ${process.env.EMAIL_USER}</p>
        <p><strong>From:</strong> Concert Ticket System</p>
        <p>Now you can send real emails to users!</p>
      `
    });

    console.log('✅ Test email sent!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log('\n✅ EVERYTHING IS WORKING!');
    console.log('   Emails will be sent when users login/book');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure EMAIL_USER is set in .env');
    console.log('2. Make sure EMAIL_PASSWORD is correct (16 chars, no spaces)');
    console.log('3. Make sure 2-Factor Authentication is enabled on Gmail');
    console.log('4. Try creating a NEW app password');
    process.exit(1);
  }
}

test();
