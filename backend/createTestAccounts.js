const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestAccounts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing test accounts
        await User.deleteMany({ email: { $in: ['parent@test.com', 'child@test.com'] } });
        console.log('🗑️  Cleared existing test accounts');

        // Create Parent Account
        const parent = new User({
            name: 'Test Parent',
            email: 'parent@test.com',
            password: 'password123',
            role: 'parent'
        });
        await parent.save();
        console.log('✅ Parent account created:');
        console.log('   Email: parent@test.com');
        console.log('   Password: password123');
        console.log('   ID:', parent._id);

        // Create Child Account (linked to parent)
        const child = new User({
            name: 'Test Child',
            email: 'child@test.com',
            password: 'password123',
            role: 'child',
            age: 12,
            parentId: parent._id  // Link to parent
        });
        await child.save();
        console.log('✅ Child account created:');
        console.log('   Email: child@test.com');
        console.log('   Password: password123');
        console.log('   Age: 12');
        console.log('   Linked to Parent ID:', child.parentId);

        console.log('\n🎉 Test accounts created successfully!');
        console.log('\n📝 Login Instructions:');
        console.log('1. Go to http://localhost:3001');
        console.log('2. Login as Parent: parent@test.com / password123');
        console.log('3. Or login as Child: child@test.com / password123');
        console.log('4. Try sending messages between accounts!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTestAccounts();
