/**
 * Seed script — populates MongoDB with realistic demo data.
 * Run: node server/seed.cjs
 */
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const MONGO_URI = 'mongodb://localhost:27017/cleanupcrew';

// bcrypt "$2b$10$..." hash for password "Password123!"
// (pre-computed so we don't need the bcrypt dependency)
const PASSWORD_HASH = '$2b$10$dG5Qj3qx7pRz8ZP3XFhWxeYK1TJ9G5U7w6IqY5Zy8c3v2L9kJGm.i';

function uuid() {
  return crypto.randomUUID();
}

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function pastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();

  console.log('🌱 Connected to MongoDB. Seeding...');

  // ─── Clear existing data ───────────────────────────────────────────
  await db.collection('users').deleteMany({});
  await db.collection('reports').deleteMany({});
  await db.collection('drives').deleteMany({});
  await db.collection('donations').deleteMany({});
  await db.collection('attendances').deleteMany({});
  await db.collection('expenses').deleteMany({});
  await db.collection('activitylogs').deleteMany({});
  console.log('  ✓ Cleared old data');

  // ─── Users ─────────────────────────────────────────────────────────
  const users = [
    { _id: new ObjectId(), email: 'admin@cleanupcrew.in', role: 'admin', profile: { name: 'Admin' }, emailVerified: true },
    { _id: new ObjectId(), email: 'arjun.mehta@example.com', role: 'user', profile: { name: 'Arjun Mehta' }, emailVerified: true },
    { _id: new ObjectId(), email: 'kavya.nair@example.com', role: 'user', profile: { name: 'Kavya Nair' }, emailVerified: true },
    { _id: new ObjectId(), email: 'rohit.joshi@example.com', role: 'user', profile: { name: 'Rohit Joshi' }, emailVerified: true },
    { _id: new ObjectId(), email: 'meera.patel@example.com', role: 'user', profile: { name: 'Meera Patel' }, emailVerified: true },
    { _id: new ObjectId(), email: 'siddharth.rao@example.com', role: 'user', profile: { name: 'Siddharth Rao' }, emailVerified: true },
    { _id: new ObjectId(), email: 'aisha.khan@example.com', role: 'user', profile: { name: 'Aisha Khan' }, emailVerified: true },
    { _id: new ObjectId(), email: 'nikhil.reddy@example.com', role: 'user', profile: { name: 'Nikhil Reddy' }, emailVerified: true },
    { _id: new ObjectId(), email: 'pooja.sharma@example.com', role: 'user', profile: { name: 'Pooja Sharma' }, emailVerified: true },
    { _id: new ObjectId(), email: 'karan.desai@example.com', role: 'user', profile: { name: 'Karan Desai' }, emailVerified: true },
    { _id: new ObjectId(), email: 'riya.agarwal@example.com', role: 'user', profile: { name: 'Riya Agarwal' }, emailVerified: true },
    { _id: new ObjectId(), email: 'priya.sharma@example.com', role: 'user', profile: { name: 'Priya Sharma' }, emailVerified: true },
    { _id: new ObjectId(), email: 'ananya.gupta@example.com', role: 'organizer', profile: { name: 'Ananya Gupta' }, emailVerified: true },
    { _id: new ObjectId(), email: 'vikram.singh@example.com', role: 'user', profile: { name: 'Vikram Singh' }, emailVerified: true },
    { _id: new ObjectId(), email: 'sneha.reddy@example.com', role: 'user', profile: { name: 'Sneha Reddy' }, emailVerified: true },
    { _id: new ObjectId(), email: 'amit.das@example.com', role: 'user', profile: { name: 'Amit Das' }, emailVerified: true },
  ];

  const userDocs = users.map(u => ({
    ...u,
    passwordHash: PASSWORD_HASH,
    organizerApproved: u.role === 'organizer',
    stats: { volunteerHours: Math.floor(Math.random() * 200), donations: Math.floor(Math.random() * 10) },
    createdAt: pastDate(Math.floor(Math.random() * 180) + 30),
    updatedAt: new Date(),
  }));

  await db.collection('users').insertMany(userDocs);
  console.log(`  ✓ Inserted ${userDocs.length} users`);

  const adminUser = users[0];

  // ─── Reports (spots) ───────────────────────────────────────────────
  const reports = [
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1618477461853-cf6ed80f4710?w=800&q=80'],
      location: { type: 'Point', coordinates: [72.8267, 19.0948] },
      description: 'Heavy garbage dumping near Juhu Beach entrance. Plastic bags, bottles, and food waste piled up.',
      severity: 'high',
      status: 'drive_created',
      createdBy: users[1]._id,
      duplicates: [],
      createdAt: pastDate(20),
      updatedAt: pastDate(18),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&q=80'],
      location: { type: 'Point', coordinates: [77.2310, 28.6692] },
      description: 'Yamuna river bank covered in industrial waste and plastic. Severe pollution affecting water quality.',
      severity: 'high',
      status: 'drive_created',
      createdBy: users[2]._id,
      duplicates: [],
      createdAt: pastDate(25),
      updatedAt: pastDate(22),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'],
      location: { type: 'Point', coordinates: [77.5929, 12.9763] },
      description: 'Cubbon Park walkways littered with construction debris and plastic waste blocking drainage.',
      severity: 'medium',
      status: 'drive_created',
      createdBy: users[3]._id,
      duplicates: [],
      createdAt: pastDate(30),
      updatedAt: pastDate(28),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80'],
      location: { type: 'Point', coordinates: [73.8369, 15.5007] },
      description: 'Post-monsoon beach littered with festival waste, broken idols, and plastic decorations.',
      severity: 'high',
      status: 'verified',
      createdBy: users[4]._id,
      duplicates: [],
      createdAt: pastDate(10),
      updatedAt: pastDate(8),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80'],
      location: { type: 'Point', coordinates: [88.3639, 22.5726] },
      description: 'Canal completely choked with solid waste and sewage overflow near residential area.',
      severity: 'high',
      status: 'cleaned',
      createdBy: users[5]._id,
      duplicates: [],
      createdAt: pastDate(60),
      updatedAt: pastDate(40),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1567942712661-82b9b407dadb?w=800&q=80'],
      location: { type: 'Point', coordinates: [78.4738, 17.4239] },
      description: 'Hussain Sagar Lake covered with floating debris, plastic waste, and invasive weeds.',
      severity: 'high',
      status: 'cleaned',
      createdBy: users[6]._id,
      duplicates: [],
      createdAt: pastDate(70),
      updatedAt: pastDate(50),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80'],
      location: { type: 'Point', coordinates: [72.8777, 19.0760] },
      description: 'Illegal dump site behind railway tracks with medical waste and broken glass.',
      severity: 'high',
      status: 'reported',
      createdBy: users[7]._id,
      duplicates: [],
      createdAt: pastDate(3),
      updatedAt: pastDate(3),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80'],
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
      description: 'Plastic waste accumulation near park entrance, overflowing bins and scattered litter.',
      severity: 'medium',
      status: 'reported',
      createdBy: users[8]._id,
      duplicates: [],
      createdAt: pastDate(2),
      updatedAt: pastDate(2),
    },
    {
      _id: new ObjectId(),
      photoUrls: ['https://images.unsplash.com/photo-1572314493295-09c6d5ec3cdf?w=800&q=80'],
      location: { type: 'Point', coordinates: [78.4867, 17.3850] },
      description: 'Construction rubble dumped illegally near residential colony, dust pollution hazard.',
      severity: 'medium',
      status: 'reported',
      createdBy: users[9]._id,
      duplicates: [],
      createdAt: pastDate(1),
      updatedAt: pastDate(1),
    },
  ];

  await db.collection('reports').insertMany(reports);
  console.log(`  ✓ Inserted ${reports.length} reports`);

  // ─── Drives ────────────────────────────────────────────────────────
  const drives = [
    {
      _id: new ObjectId(),
      title: 'Mumbai Beach Cleanup Marathon',
      location: { type: 'Point', coordinates: [72.8267, 19.0948] },
      date: futureDate(5),
      maxVolunteers: 120,
      fundingGoal: 50000,
      fundingRaised: 38500,
      requiredRoles: [
        { role: 'Cleaner', capacity: 60, booked: 45, waitlist: 3 },
        { role: 'Coordinator', capacity: 10, booked: 8, waitlist: 0 },
        { role: 'Photographer', capacity: 5, booked: 3, waitlist: 0 },
        { role: 'LogisticsHelper', capacity: 45, booked: 33, waitlist: 2 },
      ],
      status: 'active',
      reportId: reports[0]._id,
      createdAt: pastDate(15),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId(),
      title: 'Yamuna River Revival Drive',
      location: { type: 'Point', coordinates: [77.2310, 28.6692] },
      date: futureDate(12),
      maxVolunteers: 200,
      fundingGoal: 85000,
      fundingRaised: 72000,
      requiredRoles: [
        { role: 'Cleaner', capacity: 100, booked: 80, waitlist: 5 },
        { role: 'Coordinator', capacity: 20, booked: 16, waitlist: 0 },
        { role: 'Photographer', capacity: 10, booked: 8, waitlist: 0 },
        { role: 'LogisticsHelper', capacity: 70, booked: 52, waitlist: 7 },
      ],
      status: 'active',
      reportId: reports[1]._id,
      createdAt: pastDate(20),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId(),
      title: 'Cubbon Park Restoration',
      location: { type: 'Point', coordinates: [77.5929, 12.9763] },
      date: futureDate(20),
      maxVolunteers: 80,
      fundingGoal: 30000,
      fundingRaised: 18500,
      requiredRoles: [
        { role: 'Cleaner', capacity: 40, booked: 22, waitlist: 0 },
        { role: 'Coordinator', capacity: 8, booked: 5, waitlist: 0 },
        { role: 'Photographer', capacity: 4, booked: 2, waitlist: 0 },
        { role: 'LogisticsHelper', capacity: 28, booked: 13, waitlist: 0 },
      ],
      status: 'planned',
      reportId: reports[2]._id,
      createdAt: pastDate(10),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId(),
      title: 'Kolkata Canal Cleanup',
      location: { type: 'Point', coordinates: [88.3639, 22.5726] },
      date: pastDate(45),
      maxVolunteers: 100,
      fundingGoal: 45000,
      fundingRaised: 45000,
      requiredRoles: [
        { role: 'Cleaner', capacity: 50, booked: 50, waitlist: 0 },
        { role: 'Coordinator', capacity: 12, booked: 12, waitlist: 0 },
        { role: 'Photographer', capacity: 6, booked: 6, waitlist: 0 },
        { role: 'LogisticsHelper', capacity: 32, booked: 32, waitlist: 0 },
      ],
      status: 'completed',
      reportId: reports[4]._id,
      createdAt: pastDate(60),
      updatedAt: pastDate(40),
    },
    {
      _id: new ObjectId(),
      title: 'Hyderabad Lake Restoration',
      location: { type: 'Point', coordinates: [78.4738, 17.4239] },
      date: pastDate(55),
      maxVolunteers: 90,
      fundingGoal: 55000,
      fundingRaised: 55000,
      requiredRoles: [
        { role: 'Cleaner', capacity: 45, booked: 45, waitlist: 0 },
        { role: 'Coordinator', capacity: 10, booked: 10, waitlist: 0 },
        { role: 'Photographer', capacity: 5, booked: 5, waitlist: 0 },
        { role: 'LogisticsHelper', capacity: 30, booked: 30, waitlist: 0 },
      ],
      status: 'completed',
      reportId: reports[5]._id,
      createdAt: pastDate(70),
      updatedAt: pastDate(50),
    },
  ];

  await db.collection('drives').insertMany(drives);
  console.log(`  ✓ Inserted ${drives.length} drives`);

  // ─── Attendance (volunteer check-ins for leaderboard) ──────────────
  const attendanceDocs = [];
  // Users 1-10 participated in completed drives (3 and 4) for leaderboard
  const completedDrives = [drives[3], drives[4]]; // Kolkata + Hyderabad (completed)
  const activeDrives = [drives[0], drives[1], drives[2]]; // Mumbai, Yamuna, Cubbon

  // Give top volunteers many check-ins across drives
  const volunteerParticipation = [
    { userIdx: 1, driveIdxs: [0, 1, 2, 3, 4] }, // Arjun - all drives
    { userIdx: 2, driveIdxs: [0, 1, 3, 4] },     // Kavya
    { userIdx: 3, driveIdxs: [0, 1, 3] },         // Rohit
    { userIdx: 4, driveIdxs: [1, 3, 4] },         // Meera
    { userIdx: 5, driveIdxs: [0, 3] },             // Siddharth
    { userIdx: 6, driveIdxs: [1, 4] },             // Aisha
    { userIdx: 7, driveIdxs: [3, 4] },             // Nikhil
    { userIdx: 8, driveIdxs: [0] },                // Pooja
    { userIdx: 9, driveIdxs: [3] },                // Karan
    { userIdx: 10, driveIdxs: [4] },               // Riya
  ];

  const roles = ['Cleaner', 'Coordinator', 'Photographer', 'LogisticsHelper'];
  for (const vp of volunteerParticipation) {
    for (const di of vp.driveIdxs) {
      const drive = drives[di];
      const isCompleted = drive.status === 'completed';
      attendanceDocs.push({
        _id: new ObjectId(),
        driveId: drive._id,
        userId: users[vp.userIdx]._id,
        role: roles[vp.userIdx % roles.length],
        qrCode: uuid(),
        status: isCompleted ? 'checked_in' : 'booked',
        checkedInAt: isCompleted ? pastDate(Math.floor(Math.random() * 30) + 40) : undefined,
        createdAt: pastDate(Math.floor(Math.random() * 30) + 20),
        updatedAt: new Date(),
      });
    }
  }

  await db.collection('attendances').insertMany(attendanceDocs);
  console.log(`  ✓ Inserted ${attendanceDocs.length} attendance records`);

  // ─── Donations ─────────────────────────────────────────────────────
  const donationDocs = [
    { userId: users[11]._id, driveId: drives[0]._id, amount: 500000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[13]._id, driveId: drives[0]._id, amount: 250000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[12]._id, driveId: drives[1]._id, amount: 1000000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[13]._id, driveId: drives[1]._id, amount: 750000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[14]._id, driveId: drives[2]._id, amount: 300000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[15]._id, driveId: drives[3]._id, amount: 1500000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[11]._id, driveId: drives[3]._id, amount: 800000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[12]._id, driveId: drives[4]._id, amount: 1200000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[15]._id, driveId: drives[4]._id, amount: 600000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
    { userId: users[1]._id, driveId: drives[0]._id, amount: 200000, stripePaymentId: `pi_seed_${uuid()}`, status: 'completed' },
  ].map(d => ({
    _id: new ObjectId(),
    ...d,
    createdAt: pastDate(Math.floor(Math.random() * 30) + 5),
    updatedAt: new Date(),
  }));

  await db.collection('donations').insertMany(donationDocs);
  console.log(`  ✓ Inserted ${donationDocs.length} donations`);

  // ─── Expenses ──────────────────────────────────────────────────────
  const expenseDocs = [
    { driveId: drives[3]._id, category: 'Equipment', amount: 12000, receiptUrl: '', isVerified: true },
    { driveId: drives[3]._id, category: 'Transport', amount: 8000, receiptUrl: '', isVerified: true },
    { driveId: drives[3]._id, category: 'Refreshments', amount: 5000, receiptUrl: '', isVerified: false },
    { driveId: drives[3]._id, category: 'Misc', amount: 3500, receiptUrl: '', isVerified: false },
    { driveId: drives[4]._id, category: 'Equipment', amount: 15000, receiptUrl: '', isVerified: true },
    { driveId: drives[4]._id, category: 'Transport', amount: 10000, receiptUrl: '', isVerified: true },
    { driveId: drives[4]._id, category: 'Refreshments', amount: 6000, receiptUrl: '', isVerified: false },
    { driveId: drives[0]._id, category: 'Equipment', amount: 9000, receiptUrl: '', isVerified: false },
  ].map(e => ({
    _id: new ObjectId(),
    ...e,
    submittedBy: adminUser._id,
    createdAt: pastDate(Math.floor(Math.random() * 20) + 5),
    updatedAt: new Date(),
  }));

  await db.collection('expenses').insertMany(expenseDocs);
  console.log(`  ✓ Inserted ${expenseDocs.length} expenses`);

  // ─── Ensure indexes ────────────────────────────────────────────────
  await db.collection('reports').createIndex({ location: '2dsphere' });
  await db.collection('drives').createIndex({ location: '2dsphere' });
  await db.collection('drives').createIndex({ status: 1 });
  await db.collection('attendances').createIndex({ driveId: 1, userId: 1 }, { unique: true });
  console.log('  ✓ Indexes created');

  console.log('\n🎉 Seed complete! Summary:');
  console.log(`   Users:       ${userDocs.length}`);
  console.log(`   Reports:     ${reports.length}`);
  console.log(`   Drives:      ${drives.length}`);
  console.log(`   Attendance:  ${attendanceDocs.length}`);
  console.log(`   Donations:   ${donationDocs.length}`);
  console.log(`   Expenses:    ${expenseDocs.length}`);

  await client.close();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
