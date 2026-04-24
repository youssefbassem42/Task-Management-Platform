const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testApi() {
  await mongoose.connect('mongodb+srv://test:password1234@taskmanagementsystem.fkak4qk.mongodb.net/?appName=TaskManagementSystem');
  
  // Register a user using the API
  const email = 'bug_test@example.com';
  const password = 'OldPassword123!';
  
  try {
    console.log("Registering user...");
    await fetch(`http://localhost:8000/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bug Test', email, password })
    });
    
    // Manually verify email to allow login
    await User.updateOne({ email }, { $set: { isVerified: true } });
    
    console.log("Logging in...");
    const loginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    console.log("Login token:", loginData.token ? "Exists" : "Missing");

    console.log("Updating password...");
    const newPassword = 'NewPassword123!';
    const updateRes = await fetch(`http://localhost:8000/api/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({ currentPassword: password, newPassword })
    });
    const updateData = await updateRes.json();
    console.log("Update response:", updateRes.status, updateData.message || 'Success');

    console.log("Logging in with new password...");
    const newLoginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword })
    });
    console.log("New login status:", newLoginRes.status);
    console.log("New login response:", await newLoginRes.json());
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await mongoose.disconnect();
}
testApi();
