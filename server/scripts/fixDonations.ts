import mongoose from 'mongoose';
import { Drive } from '../src/models/drive.model';
import { Donation } from '../src/models/donation.model';
import { User } from '../src/models/user.model';
import 'dotenv/config';

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cleanupcrew');
  const users = await User.find({ role: 'user' });
  if (users.length === 0) { console.log('No users'); return; }
  const drives = await Drive.find();
  for (const drive of drives) {
    const donations = await Donation.find({ driveId: drive._id, status: 'completed' });
    const sum = donations.reduce((acc, d) => acc + d.amount, 0);
    const target = (drive.fundingRaised || 0) * 100;
    if (sum < target) {
      const diff = target - sum;
      const user = users[Math.floor(Math.random() * users.length)];
      await Donation.create({
        driveId: drive._id,
        userId: user._id,
        amount: diff,
        status: 'completed',
        stripePaymentId: 'pi_mock_' + Math.random().toString(36).substring(7),
        createdAt: drive.date,
      });
      console.log('Added ' + diff + ' to ' + drive.title);
    }
  }
  console.log('Done fixing donations');
  await mongoose.disconnect();
}
fix().catch(console.error);
