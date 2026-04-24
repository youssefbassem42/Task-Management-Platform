const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testApi() {
  await mongoose.connect('mongodb+srv://test:password1234@taskmanagementsystem.fkak4qk.mongodb.net/?appName=TaskManagementSystem');
  
  // Create a user
  await User.deleteOne({ email: 'api_update@example.com' });
  const hashedPassword = await bcrypt.hash('OldPassword123!', 10);
  
  const user = await User.create({
    name: 'Test API Update',
    email: 'api_update@example.com',
    password: hashedPassword,
    isVerified: true
  });
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '781e14b103aaf599f00f6fb24c08d2fa690613fe35f0d02b3eba5d9f57527da44d1c5a4b563e464fa088ec45e352de8cc914c71a6860b58373e6413bdd4749d2', { expiresIn: "7d" });
  
  console.log('User created for update profile test');

  // Request to update profile password
  try {
    const res = await fetch(`http://localhost:8000/api/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!' 
      })
    });
    const data = await res.json();
    console.log('Update response:', res.status, data);
    
    // Now try to login
    const loginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'api_update@example.com',
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
