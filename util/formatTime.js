function getTimeComponents(timestamp) {
    let timeComponents = {};
    timeComponents.days = Math.floor(timestamp / 86400000 );
    timestamp %= 86400000;
    timeComponents.hours = Math.floor(timestamp / 3600000 );
    timestamp %= 3600000;
    timeComponents.minutes = Math.floor(timestamp / 60000);
    timestamp %= 60000;
    timeComponents.seconds = Math.floor(timestamp / 1000);
    timestamp %= 1000;
    timeComponents.milliseconds = timestamp;
    return timeComponents;
}

module.exports = { getTimeComponents };