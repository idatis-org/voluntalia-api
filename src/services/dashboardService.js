const { User, Activity, WorkLog } = require('../models');
const { Op } = require('sequelize');
const { VOLUNTEER } = require('../constants/roles');

// * Get aggregated stats for the dashboard
exports.getStats = async () => {
    // 1. Total Volunteers
    const totalVolunteers = await User.count({
        where: { role: VOLUNTEER, is_active: true },
    });

    // 2. Active Activities (future date or today)
    const activeActivities = await Activity.count({
        where: {
            date: {
                [Op.gte]: new Date(), // Date is greater than or equal to now
            },
        },
    });

    // 3. Hours This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const workLogs = await WorkLog.findAll({
        where: {
            week_start: {
                [Op.gte]: startOfMonth,
                [Op.lt]: endOfMonth,
            },
        },
        attributes: ['hours'],
    });

    // * hours is a plain decimal number (see WorkLog model)
    const hoursThisMonth = workLogs.reduce((sum, wl) => sum + (wl.hours || 0), 0);

    return {
        totalVolunteers,
        activeActivities,
        hoursThisMonth: Math.round(hoursThisMonth * 10) / 10, // Round to 1 decimal
    };
};
