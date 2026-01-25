const mongoose = require('mongoose');
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

async function linkChildToParent() {
    try {
        console.log('\n🔍 Finding parent account...');

        // Find parent account
        const parent = await User.findOne({ email: 'monikakn@gmail.com', role: 'parent' });

        if (!parent) {
            console.log('❌ Parent account not found!');
            console.log('Please create parent account first with email: monikakn@gmail.com');
            process.exit(1);
        }

        console.log(`✅ Found parent: ${parent.name} (${parent.email})`);
        console.log(`   Parent ID: ${parent._id}`);

        console.log('\n🔍 Finding child account...');

        // Find child account
        const child = await User.findOne({ email: 'pragathi1105@gmail.com' });

        if (!child) {
            console.log('❌ Child account not found!');
            console.log('Please create the child account first.');
            process.exit(1);
        }

        console.log(`✅ Found child: ${child.name} (${child.email})`);

        // Link child to parent
        console.log('\n🔗 Linking child to parent...');
        child.parentId = parent._id;
        await child.save();

        console.log('✅ Link successful!');
        console.log(`   Child ${child.email} is now linked to parent ${parent.email}`);

        console.log('\n✨ Setup Complete!');
        console.log('\n📋 Linked Accounts:');
        console.log('─────────────────────────────────');
        console.log('PARENT ACCOUNT:');
        console.log(`  Email: ${parent.email}`);
        console.log('  Password: monikakn');
        console.log('');
        console.log('CHILD ACCOUNT:');
        console.log(`  Email: ${child.email}`);
        console.log('  Password: pragathi');
        console.log(`  Linked to: ${parent.email}`);
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

linkChildToParent();
