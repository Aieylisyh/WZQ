let DateUtil = {
    // time 单位是毫秒
    getRestHoursInWeek: function (time) {
        if (time == null) {
            return 0;
        }

        // 开始日期
        let startDate = new Date(time);
        let year = startDate.getFullYear(); // 年
        let month = startDate.getMonth() + 1; // 月
        let date = startDate.getDate(); // 日
        let day = startDate.getDay() === 0 ? 7 : startDate.getDay(); // 星期几
        let totalDatesInMonth = null;
        if (this.isBigMoon(month)) {
            totalDatesInMonth = 31;
        } else {
            if (month !== 2) {
                totalDatesInMonth = 30;
            } else {
                totalDatesInMonth = this.isLeapYear(year) ? 29 : 28;
            }
        }

        // 结束日期
        let endDate = null;
        let restDay = 7 - day;
        let targetDate = date + restDay + 1;
        if (targetDate <= totalDatesInMonth) {
            endDate = new Date(year, month - 1, targetDate);
        } else {
            targetDate = targetDate - totalDatesInMonth;
            if (month !== 12) {
                endDate = new Date(year, month, targetDate);
            } else {
                endDate = new Date(year + 1, 0, targetDate);
            }
        }

        let deltaTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(deltaTime / 3600000);
    },

    // time 单位是毫秒
    getRestHoursInMonth: function (time) {
        if (time == null) {
            return 0;
        }

        // 开始日期
        let startDate = new Date(time);
        let year = startDate.getFullYear(); // 年
        let month = startDate.getMonth() + 1; // 月

        let endDate = null;
        if (month !== 12) {
            endDate = new Date(year, month, 1);
        } else {
            endDate = new Date(year + 1, 0, 1);
        }

        let deltaTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(deltaTime / 3600000);
    },

    // 是否是闰年(能被4整除)
    isLeapYear: function (year) {
        return (year % 4 === 0);
    },

    // 是否是大月
    isBigMoon: function (month) {
        if (month === 1 || month === 3 || month === 5 || month === 7 ||
            month === 8 || month === 10 || month === 12) {
            return true;
        } else {
            return false;
        }
    },
};

module.exports = DateUtil;