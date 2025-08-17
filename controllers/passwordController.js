
const User = require('../models/User');
const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
const  sequelize  = require('../utils/db');
const ForgotPasswordRequest = require('../models/ForgotPasswordRequest');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
    }

      // Create a new forgot password request
    const resetRequest = await ForgotPasswordRequest.create({
      userId: user.id,
    });

    // Build reset URL
    const resetUrl = `http://localhost:3000/password/resetpassword/${resetRequest.id}`;


    // Initialize Sendinblue
    const client = Sib.ApiClient.instance;
    const apiKeyInstance = client.authentications['api-key'];
    
     if (!process.env.SIB_API_KEY) {
  console.log('Missing Sendinblue API key');
}
apiKeyInstance.apiKey = process.env.SIB_API_KEY.trim();
    const tranEmailApi = new Sib.TransactionalEmailsApi();


    const sender = { email: 'kalyani.brm@gmail.com', name: 'Kalyani Sahu' }; 
    const receivers = [{ email :'sunil.sahu6522@gmail.com' }];

     const emailBody = `
      <p>Hi ${user.name || ''},</p>
      <p>You (or someone using your email) requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Reset Password',
      htmlContent: emailBody,
    });

    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    console.error('Error sending mail:', error);
    res.status(500).json({ error: 'Could not send email' });
  }
};

exports.renderResetForm= async(req,res)=> {
   const{uuid}=req.params ;
   try {
    const request = await ForgotPasswordRequest.findOne({ where: { id: uuid } });

    if (!request || !request.isActive) {
      return res.status(400).send('Invalid or expired reset link.');
    }

    // You can serve an HTML page; for simplicity, sending minimal HTML
    return res.send(`
      <form method="POST" action="/password/resetpassword/${uuid}">
        <h3>Set New Password</h3>
        <input type="password" name="password" placeholder="New password" required />
        <button type="submit">Update Password</button>
      </form>
    `);
  } catch (error) {
    console.error('Error rendering reset form:', error);
    return res.status(500).send('Server error.');
  }
};

exports.resetPassword = async (req, res) => {
  const { uuid } = req.params;
  const { password } = req.body;

  try {
    const request = await ForgotPasswordRequest.findOne({ where: { id: uuid } });
    if (!request || !request.isActive) {
      return res.status(400).json({ error: 'Invalid or already used reset link.' });
    }
    
    console.log('Reset request found:', request.toJSON());
    console.log('Associated userId:', request.userId);

    const user = await User.findByPk(request.userId);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user.' });
    }

    // Hash new password
    const hashed = await bcrypt.hash(password, 10);
    await user.update({ password: hashed });

    // Deactivate the request
    await request.update({ isActive: false });

    return res.status(200).json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Could not reset password.' });
  }
};
