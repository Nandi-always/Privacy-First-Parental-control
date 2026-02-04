const Child = require("../models/Child");
const ScreenTime = require("../models/ScreenTime");
const AppRule = require("../models/AppRule");

/**
 * Enforcement Middleware - Real-time parental control rule checking
 * Determines if a child's device should be locked and what restrictions apply
 */

// Helper: Check if current time is between two time strings (handles overnight ranges)
const isTimeBetween = (currentTime, startTime, endTime) => {
    const current = new Date(`1970-01-01T${currentTime}`);
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    // Handle overnight time ranges (e.g., 22:00 to 06:00)
    if (end < start) {
        return current >= start || current <= end;
    }
    return current >= start && current <= end;
};

// Helper: Get current day type (weekday or weekend)
const isWeekend = (date = new Date()) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Helper: Get appropriate daily limit based on current day
const getDailyLimit = (child) => {
    if (isWeekend()) {
        return child.weekendScreenTimeLimit || child.dailyScreenTimeLimit;
    }
    return child.weekdayScreenTimeLimit || child.dailyScreenTimeLimit;
};

// Helper: Format time remaining as friendly message
const formatTimeRemaining = (minutes) => {
    if (minutes <= 0) return "No time remaining";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m remaining`;
    }
    return `${mins} minutes remaining`;
};

/**
 * Main enforcement function - Check device status for a child
 * @param {String} childId - Child's MongoDB ID
 * @returns {Object} Status object with lock state and restrictions
 */
exports.checkDeviceStatus = async (childId) => {
    try {
        const child = await Child.findById(childId);
        if (!child) {
            return { error: "Child not found", isLocked: true, lockReason: "error" };
        }

        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
        const today = now.toDateString();

        // Initialize status object
        const status = {
            isLocked: false,
            lockReason: null,
            remainingTime: 0,
            shouldWarn: false,
            warningMessage: null,
            allowedApps: [],
            currentLimit: getDailyLimit(child),
            isHomeworkHours: false,
            isWeekend: isWeekend(now),
            currentDayType: isWeekend(now) ? "weekend" : "weekday"
        };

        // 1. CHECK BEDTIME ENFORCEMENT
        if (child.enforceBedtime && isTimeBetween(currentTime, child.bedtimeStart, child.bedtimeEnd)) {
            status.isLocked = true;
            status.lockReason = "bedtime";
            status.warningMessage = `Device locked for bedtime. Available at ${child.bedtimeEnd}`;
            return status;
        }

        // 2. CHECK SCHOOL HOURS ENFORCEMENT
        if (child.schoolHours && isTimeBetween(currentTime, child.schoolStart, child.schoolEnd)) {
            const dayOfWeek = now.getDay();
            // Only enforce on weekdays (Monday=1 to Friday=5)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                status.isLocked = true;
                status.lockReason = "school_hours";
                status.warningMessage = `Device restricted during school hours. Available at ${child.schoolEnd}`;
                return status;
            }
        }

        // 3. CHECK HOMEWORK HOURS (allows educational apps)
        if (child.homeworkHoursEnabled && isTimeBetween(currentTime, child.homeworkStart, child.homeworkEnd)) {
            status.isHomeworkHours = true;
            status.allowedApps.push("educational");
        }

        // 4. CHECK SCREEN TIME LIMIT
        const screenTime = await ScreenTime.findOne({
            child: childId,
            date: today
        });

        const totalTimeUsed = screenTime ? screenTime.totalTime : 0;
        const dailyLimit = getDailyLimit(child);
        const remainingTime = dailyLimit - totalTimeUsed;

        status.remainingTime = Math.max(0, remainingTime);
        status.totalTimeUsed = totalTimeUsed;

        // Check if screen time exceeded
        if (remainingTime <= 0) {
            status.isLocked = true;
            status.lockReason = "screen_time_exceeded";
            status.warningMessage = `Daily screen time limit reached (${dailyLimit} minutes). Try again tomorrow!`;
            return status;
        }

        // Check if warning should be shown (10 minutes or less remaining)
        if (remainingTime <= child.warningThreshold) {
            status.shouldWarn = true;
            status.warningMessage = `⚠️ Only ${remainingTime} minutes of screen time left today!`;
        }

        // 5. CHECK APP-SPECIFIC RULES
        const appRules = await AppRule.find({ child: childId });
        const allowedApps = [];
        const blockedApps = [];

        for (const rule of appRules) {
            // Check if app is blocked
            if (rule.isBlocked) {
                blockedApps.push(rule.appName);
                continue;
            }

            // Check time-based restrictions
            if (rule.allowedTimeSlots && rule.allowedTimeSlots.length > 0) {
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
                const todaySlot = rule.allowedTimeSlots.find(slot => slot.day === currentDay);

                if (todaySlot) {
                    // Check if current time is within allowed slot
                    if (isTimeBetween(currentTime, todaySlot.startTime, todaySlot.endTime)) {
                        allowedApps.push(rule.appName);
                    } else {
                        blockedApps.push(rule.appName);
                    }
                } else {
                    // No slot for today, app is blocked
                    blockedApps.push(rule.appName);
                }
            } else {
                // No time restrictions, app is allowed
                allowedApps.push(rule.appName);
            }
        }

        status.allowedApps = [...status.allowedApps, ...allowedApps];
        status.blockedApps = blockedApps;

        // 6. CHECK IF DEVICE IS PAUSED BY PARENT
        if (screenTime && screenTime.isPaused) {
            status.isLocked = true;
            status.lockReason = "parent_paused";
            status.warningMessage = "Internet access paused by parent";
            return status;
        }

        return status;
    } catch (err) {
        console.error("Enforcement check error:", err);
        return {
            error: err.message,
            isLocked: false,
            lockReason: null,
            remainingTime: 0
        };
    }
};

/**
 * Express route handler for GET /api/child/:childId/status
 */
exports.getDeviceStatus = async (req, res) => {
    try {
        const { childId } = req.params;
        const status = await exports.checkDeviceStatus(childId);
        res.status(200).json(status);
    } catch (err) {
        console.error("Error getting device status:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
