import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:5000/db';

const sampleAddresses = [
  {
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    zip: '400001',
  },
  {
    address: '456 Park Avenue',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    zip: '110001',
  },
  {
    address: '789 Ocean Drive',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    zip: '560001',
  },
];

const samplePhones = [
  '+919876543210',
  '+918765432109',
  '+917654321098',
];

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  populateUsers();
}).catch((err) => console.error(err));

async function populateUsers() {
  try {
    const users = await User.find();
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      // Only update if phone or addresses are missing
      if (!user.phone) user.phone = samplePhones[i % samplePhones.length];
      if (!user.billingAddress) user.billingAddress = sampleAddresses[i % sampleAddresses.length];
      if (!user.shippingAddress) user.shippingAddress = sampleAddresses[(i + 1) % sampleAddresses.length];

      await user.save();
      console.log(`Updated user: ${user.name}`);
    }
    console.log('All users updated successfully!');
    process.exit();
  } catch (err) {
    console.error('Error updating users:', err);
    process.exit(1);
  }
}
