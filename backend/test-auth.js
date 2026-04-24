const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect('mongodb+srv://test:password1234@taskmanagementsystem.fkak4qk.mongodb.net/?appName=TaskManagementSystem');
  
  // Create a test user
  await User.deleteOne({ email: 'test_auth@example.com' });
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const user = await User.create({
    name: 'Test',
    email: 'test_auth@example.com',
    password: hashedPassword,
    isVerified: true
  });
  
  console.log('User created:', user.email);
  
  // Now simulate updateProfile
  const newPassword = 'NewPassword123!';
  const hashedNew = await bcrypt.hash(newPassword, 10);
  user.password = hashedNew;
  await user.save();
  
  console.log('Password updated.');
  
  // Now simulate login
  const loginUser = await User.findOne({ email: 'test_auth@example.com' });
  const isMatch = await bcrypt.compare(newPassword, loginUser.password);
  console.log('Login with new password match?', isMatch);
  
  await mongoose.disconnect();
}
run().catch(console.error);
