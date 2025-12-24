const ScreenTime = require("../models/ScreenTime");
const AppRule = require("../models/AppRule");
const AppDownloadAlert = require("../models/AppDownloadAlert");
const Location = require("../models/Location");

// Get daily activity summary
exports.getDailyActivitySummary = async (req, res) => {
  try {
    const { childId } = req.params;
    const { date } = req.query;

    const queryDate = new Date(date || new Date()).toDateString();

    const screenTime = await ScreenTime.findOne({
      child: childId,
      parent: req.user.id,
      date: queryDate
    });

    const downloads = await AppDownloadAlert.find({
      child: childId,
      parent: req.user.id,
      downloadTime: {
        $gte: new Date(queryDate),
        $lt: new Date(new Date(queryDate).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const location = await Location.findOne({
      child: childId,
      parent: req.user.id,
      timestamp: {
        $gte: new Date(queryDate),
        $lt: new Date(new Date(queryDate).getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ timestamp: -1 });

    res.status(200).json({
      date: queryDate,
      screenTime: screenTime || { totalTime: 0, appUsage: [] },
      appDownloads: downloads.length,
      newApps: downloads,
      lastLocation: location,
      summary: {
        totalScreenTime: screenTime?.totalTime || 0,
        topApps: screenTime?.appUsage?.sort((a, b) => b.timeSpent - a.timeSpent)?.slice(0, 5) || [],
        newAppsInstalled: downloads.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get weekly usage insights
exports.getWeeklyInsights = async (req, res) => {
  try {
    const { childId } = req.params;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const screenTimes = await ScreenTime.find({
      child: childId,
      parent: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by day
    const dailyData = {};
    screenTimes.forEach(st => {
      const day = new Date(st.date).toLocaleDateString();
      if (!dailyData[day]) dailyData[day] = { totalTime: 0, appUsage: [] };
      dailyData[day].totalTime = st.totalTime;
      dailyData[day].appUsage = st.appUsage;
    });

    // Calculate statistics
    const totalTime = screenTimes.reduce((sum, st) => sum + st.totalTime, 0);
    const avgTime = Math.round(totalTime / 7);
    const maxDay = Object.entries(dailyData).sort((a, b) => b[1].totalTime - a[1].totalTime)[0];

    res.status(200).json({
      period: "last 7 days",
      dailyBreakdown: dailyData,
      statistics: {
        totalScreenTime: totalTime,
        averageDaily: avgDay,
        highestUsageDay: maxDay ? { date: maxDay[0], time: maxDay[1].totalTime } : null,
        lowestUsageDay: Object.entries(dailyData).sort((a, b) => a[1].totalTime - b[1].totalTime)[0]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get 30-day activity report
exports.get30DayReport = async (req, res) => {
  try {
    const { childId } = req.params;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const screenTimes = await ScreenTime.find({
      child: childId,
      parent: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const downloads = await AppDownloadAlert.find({
      child: childId,
      parent: req.user.id,
      downloadTime: { $gte: startDate }
    });

    const locations = await Location.find({
      child: childId,
      parent: req.user.id,
      timestamp: { $gte: startDate }
    });

    // Calculate total app usage
    const appStats = {};
    screenTimes.forEach(st => {
      st.appUsage.forEach(app => {
        if (!appStats[app.appName]) appStats[app.appName] = { totalTime: 0, category: app.category };
        appStats[app.appName].totalTime += app.timeSpent;
      });
    });

    const totalTime = screenTimes.reduce((sum, st) => sum + st.totalTime, 0);

    res.status(200).json({
      period: "last 30 days",
      report: {
        totalScreenTime: totalTime,
        averageDailyTime: Math.round(totalTime / 30),
        totalAppsUsed: Object.keys(appStats).length,
        topApps: Object.entries(appStats)
          .sort((a, b) => b[1].totalTime - a[1].totalTime)
          .slice(0, 10),
        newAppsInstalled: downloads.length,
        locationsVisited: locations.length,
        dayWithMostUsage: screenTimes.sort((a, b) => b.totalTime - a.totalTime)[0],
        riskAssessment: totalTime > 480 * 30 ? "High screen time" : "Normal usage"
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get real-time activity status
exports.getRealtimeStatus = async (req, res) => {
  try {
    const { childId } = req.params;

    const today = new Date().toDateString();

    const screenTime = await ScreenTime.findOne({
      child: childId,
      parent: req.user.id,
      date: today
    });

    const location = await Location.findOne({
      child: childId,
      parent: req.user.id,
      isLive: true
    });

    const appRules = await AppRule.find({
      child: childId,
      parent: req.user.id
    });

    res.status(200).json({
      isOnline: screenTime ? true : false,
      currentScreenTime: screenTime?.totalTime || 0,
      currentApps: screenTime?.appUsage || [],
      isPaused: screenTime?.isPaused || false,
      location: location ? { lat: location.latitude, lng: location.longitude, address: location.address } : null,
      activeRules: appRules.length,
      stats: {
        totalTime: screenTime?.totalTime || 0,
        remainingTime: Math.max(0, require("../models/Child").findById(childId).dailyScreenTimeLimit - (screenTime?.totalTime || 0))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
