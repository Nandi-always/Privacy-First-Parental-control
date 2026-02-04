const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Alert = require("./models/Alert");
const ScreenTime = require("./models/ScreenTime");
const User = require("./models/User");

dotenv.config();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error(err));

async function seedDemoData() {
    try {
        console.log("🌱 Seeding demo data...");

        // Find existing users - look for ANY parent and the child named pragathi
        const parent = await User.findOne({ role: "parent" });
        const child = await User.findOne({ name: /pragathi/i }); // case insensitive

        if (!parent || !child) {
            console.error("❌ Users not found.");
            console.log("Available users:");
            const allUsers = await User.find({}).select("name email role");
            console.log(allUsers);
            process.exit(1);
        }

        console.log("✅ Found users:");
        console.log("  Parent:", parent.name, parent.email);
        console.log("  Child:", child.name, child.email);

        // Create demo screen time data for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Delete existing screen time for today
        await ScreenTime.deleteMany({ child: child._id, date: today });

        const screenTime = new ScreenTime({
            child: child._id,
            parent: parent._id,
            date: today,
            totalTime: 145, // 2h 25m used
            isPaused: false,
            appUsage: [
                { appName: "YouTube", timeSpent: 45, category: "Entertainment" },
                { appName: "WhatsApp", timeSpent: 35, category: "Social" },
                { appName: "Chrome", timeSpent: 30, category: "Browser" },
                { appName: "Educational App", timeSpent: 20, category: "Education" },
                { appName: "Games", timeSpent: 15, category: "Gaming" }
            ]
        });

        await screenTime.save();
        console.log("✅ Created screen time data");

        // Create demo alerts
        await Alert.deleteMany({ userId: parent._id });

        const demoAlerts = [
            {
                userId: parent._id,
                childId: child._id,
                type: "screen_time_warning",
                title: "Screen Time Warning",
                message: `${child.name} has 30 minutes remaining today`,
                severity: "warning",
                metadata: { timeRemaining: 30 }
            },
            {
                userId: parent._id,
                childId: child._id,
                type: "app_blocked",
                title: "App Blocked",
                message: "YouTube blocked during school hours",
                severity: "info",
                metadata: { appName: "YouTube" },
                isRead: true
            },
            {
                userId: parent._id,
                childId: child._id,
                type: "bedtime",
                title: "Bedtime Mode",
                message: "Device locked for bedtime at 10:00 PM",
                severity: "info",
                isRead: true,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                userId: parent._id,
                childId: child._id,
                type: "app_installed",
                title: "New App Installed",
                message: "TikTok was installed on the device",
                severity: "warning",
                metadata: { appName: "TikTok" },
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            }
        ];

        for (const alertData of demoAlerts) {
            const alert = new Alert(alertData);
            await alert.save();
        }

        console.log(`✅ Created ${demoAlerts.length} demo alerts`);

        // Create usage history for the past 7 days
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            await ScreenTime.deleteMany({ child: child._id, date });

            const randomTime = 120 + Math.floor(Math.random() * 180); // 2-5 hours
            const history = new ScreenTime({
                child: child._id,
                parent: parent._id,
                date,
                totalTime: randomTime,
                appUsage: [
                    { appName: "YouTube", timeSpent: Math.floor(randomTime * 0.3), category: "Entertainment" },
                    { appName: "WhatsApp", timeSpent: Math.floor(randomTime * 0.25), category: "Social" },
                    { appName: "Chrome", timeSpent: Math.floor(randomTime * 0.2), category: "Browser" },
                    { appName: "Educational App", timeSpent: Math.floor(randomTime * 0.15), category: "Education" },
                    { appName: "Games", timeSpent: Math.floor(randomTime * 0.1), category: "Gaming" }
                ]
            });

            await history.save();
        }

        console.log("✅ Created 7 days of usage history");
        console.log("\n🎉 Demo data seeding complete!");
        console.log("\nYou can now:");
        console.log("- View screen time: 145 minutes used today");
        console.log("- See 4 alerts in the dashboard");
        console.log("- Check 7-day usage history\n");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding demo data:", err);
        process.exit(1);
    }
}

seedDemoData();
