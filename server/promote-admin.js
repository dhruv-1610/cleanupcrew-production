/**
 * Promote a user to admin role.
 * Usage: node promote-admin.js <email>
 * Example: node promote-admin.js dhruv@example.com
 */
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017/cleanupcrew';
const email = process.argv[2];

if (!email) {
  console.log('Usage: node promote-admin.js <email>');
  console.log('Example: node promote-admin.js dhruv@example.com');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Find user
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      // List all users
      const users = await db.collection('users').find({}, { projection: { email: 1, role: 1, 'profile.name': 1 } }).toArray();
      console.log('\nExisting users:');
      users.forEach(u => console.log(`  - ${u.email} (${u.role}) ${u.profile?.name || ''}`));
      return;
    }

    // Promote to admin
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { role: 'admin' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ ${user.profile?.name || email} has been promoted to ADMIN!`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Previous role: ${user.role}`);
      console.log(`   New role: admin`);
      console.log('\n   Now log out and log back in for changes to take effect.');
    } else {
      console.log(`ℹ️  ${email} is already an admin.`);
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);
