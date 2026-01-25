const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["parent", "child"], default: "parent" },
    age: { type: Number },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const User = mongoose.model("User", UserSchema);

async function setupAccounts() {
    try {
        console.log('\n🔍 Checking for parent account...');

        // Find parent account
        const parent = await User.findOne({ email: 'monikakn@gmail.com', role: 'parent' });

        if (!parent) {
            console.log('❌ Parent account not found!');
            console.log('Please create parent account first with email: monikakn@gmail.com');
            process.exit(1);
        }

        console.log(`✅ Found parent account: ${parent.name} (${parent.email})`);
        console.log(`   Parent ID: ${parent._id}`);

        // Check if child account already exists
        let child = await User.findOne({ email: 'child@test.com' });

        if (child) {
            console.log('\n📝 Updating existing child account...');
            // Update to link with parent
            child.parentId = parent._id;
            await child.save();
            console.log(`✅ Updated child account: ${child.name}`);
        } else {
            console.log('\n➕ Creating new child account...');

            // Hash password
            const hashedPassword = await bcrypt.hash('child123', 10);

            // Create child account
            child = new User({
                name: 'Test Child',
                email: 'child@test.com',
                password: hashedPassword,
                role: 'child',
                age: 12,
                parentId: parent._id
            });

            await child.save();
            console.log(`✅ Created child account: ${child.name} (${child.email})`);
        }

        console.log(`   Linked to parent: ${parent.email}`);
        console.log(`   Parent ID: ${child.parentId}`);

        console.log('\n✨ Setup Complete!');
        console.log('\n📋 Login Credentials:');
        console.log('─────────────────────────────────');
        console.log('PARENT ACCOUNT:');
        console.log('  Email: monikakn@gmail.com');
        console.log('  Password: monikakn');
        console.log('');
        console.log('CHILD ACCOUNT:');
        console.log('  Email: child@test.com');
        console.log('  Password: child123');
        console.log('─────────────────────────────────');
        console.log('\n✅ Both accounts are now linked!');
        console.log('   - Child can send messages to parent');
        console.log('   - Parent can send messages to child');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

setupAccounts();
