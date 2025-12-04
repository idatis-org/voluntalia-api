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

    // Calculate total hours (handling the JSON/String structure of 'hours')
    const hoursThisMonth = workLogs.reduce((sum, wl) => {
        let h = 0;
        let m = 0;

        // Handle if hours is stored as JSON object or stringified JSON
        let hoursObj = wl.hours;

        if (typeof hoursObj === 'string') {
            try {
                hoursObj = JSON.parse(hoursObj);
            } catch (e) {
                // If it's a simple string number "2", treat as hours
                if (!isNaN(hoursObj)) {
                    h = parseFloat(hoursObj);
                }
                // If it's "HH:MM" format (fallback)
                else if (hoursObj.includes(':')) {
                    const parts = hoursObj.split(':');
                    h = parseInt(parts[0] || 0);
                    m = parseInt(parts[1] || 0);
                }
            }
        }

        if (hoursObj && typeof hoursObj === 'object') {
            h = typeof hoursObj.hours === 'number' ? hoursObj.hours : 0;
            m = typeof hoursObj.minutes === 'number' ? hoursObj.minutes : 0;
        }

        return sum + h + m / 60;
    }, 0);

    return {
        totalVolunteers,
        activeActivities,
        hoursThisMonth: Math.round(hoursThisMonth * 10) / 10, // Round to 1 decimal
    };
};
