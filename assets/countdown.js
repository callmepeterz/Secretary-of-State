module.exports = [
    {
        name: "Artist Day",
        timers: [
            {
                name: "Artist Day 22",
                getTime(now) {
                    return new Date(1803178800000);
                }
            }
        ]
    },

    {
        name: "Elections in the US",
        timers: [
            {
                name: "Next US presidential election",

                /**
                 * @param {Date} now 
                 */
                getTime(now, next = false){
                    const time = new Date();
                    const year = getPeriodicYear(now.getUTCFullYear(), 4, 0) + (next ? 4 : 0);
                    time.setUTCFullYear(year, 10, getFirstDayOfTheMonth(1, 10, year));
                    time.setUTCDate(time.getUTCDate() + 1);
                    time.setUTCHours(5, 0, 0, 0)

                    if(time < now) return this.getTime(now, true);
                    return time;
                }
            },

            {
                name: "Next US midterm election",

                /**
                 * @param {Date} now 
                 */
                getTime(now, next = false){
                    const time = new Date();
                    const year = getPeriodicYear(now.getUTCFullYear(), 4, 2) + (next ? 4 : 0);
                    time.setUTCFullYear(year, 10, getFirstDayOfTheMonth(1, 10, year));
                    time.setUTCDate(time.getUTCDate() + 1);
                    time.setUTCHours(5, 0, 0, 0)

                    if(time < now) return this.getTime(now, true);
                    return time;
                }
            },

            {
                name: "Next US presidential inauguration",

                /**
                 * @param {Date} now 
                 */
                getTime(now, next = false){
                    const time = new Date();
                    const year = getPeriodicYear(now.getUTCFullYear(), 4, 1) + (next ? 4 : 0);
                    time.setUTCFullYear(year, 0, 20);
                    time.setUTCHours(17, 0, 0, 0)

                    if(time < now) return this.getTime(now, true);
                    return time;
                }
            },

            {
                name: "First meeting of the next US Congress",

                /**
                 * @param {Date} now 
                 */
                getTime(now, next = false){
                    const time = new Date();
                    const year = getPeriodicYear(now.getUTCFullYear(), 2, 1) + (next ? 2 : 0);
                    time.setUTCFullYear(year, 0, 3);
                    time.setUTCHours(17, 0, 0, 0)

                    if(time < now) return this.getTime(now, true);
                    return time;
                }
            },

            {
                name: "Next New York City mayoral election",

                /**
                 * @param {Date} now 
                 */
                getTime(now, next = false){
                    const time = new Date();
                    const year = getPeriodicYear(now.getUTCFullYear(), 4, 1) + (next ? 4 : 0);
                    time.setUTCFullYear(year, 10, getFirstDayOfTheMonth(1, 10, year));
                    time.setUTCDate(time.getUTCDate() + 1);
                    time.setUTCHours(5, 0, 0, 0)

                    if(time < now) return this.getTime(now, true);
                    return time;
                }
            },

            {
                name: "Next New York City mayoral inauguration",

                /**
                 * @param {Date} now 
                 */
                getTime(now, next = false){
                    const time = new Date();
                    const year = getPeriodicYear(now.getUTCFullYear(), 4, 2) + (next ? 4 : 0);
                    time.setUTCFullYear(year, 0, 1);
                    time.setUTCHours(5, 0, 0, 0)

                    if(time < now) return this.getTime(now, true);
                    return time;
                }
            },
        ]
    },

];

function getPeriodicYear(y, d, r){
    const yr = y % d;
    if(yr === r) return y;
    else if(yr < r) return y + (r - yr);
    else return y + (d - yr) + r;
}

function getFirstDayOfTheMonth(day, month, year){
    const t = new Date();
    t.setUTCFullYear(year, month, 1);
    t.setUTCHours(0, 0, 0, 0);
    const tday = t.getUTCDay();

    if(tday < day) t.setUTCDate(1 + (day - tday));
    else if (tday > day) t.setUTCDate(1 + (7 - tday) + day);
    return t.getUTCDate();
}
