const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function testApi() {
  await mongoose.connect('mongodb+srv://test:password1234@taskmanagementsystem.fkak4qk.mongodb.net/?appName=TaskManagementSystem');
  
  // Create a user
  await User.deleteOne({ email: 'api_test@example.com' });
  const hashedPassword = await bcrypt.hash('OldPassword123!', 10);
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  const user = await User.create({
    name: 'Test API',
    email: 'api_test@example.com',
    password: hashedPassword,
    isVerified: true,
    resetPasswordToken: resetToken,
    resetPasswordExpires: Date.now() + 3600000
  });
  
  console.log('User created for API test');

  // Request to reset password
  try {
    const res = await fetch(`http://localhost:8000/api/auth/reset-password/${resetToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'NewPassword123!' })
    });
    const data = await res.json();
    console.log('Reset response:', data);
    
    // Now try to login
    const loginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'api_test@example.com',
        password: 'NewPassword123!'
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
      console.log('Login successful:', loginData.email);
    } else {
      console.log('Login failed:', loginData);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await mongoose.disconnect();
}
testApi();
