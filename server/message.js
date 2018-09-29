const moment = require('moment');


var generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment(moment().valueOf()).format('h:mm a')
    };
};

var generateLocationMessage = (from, latitude, longitude) => {
    return {
        from,
        location: `https://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt: moment(moment().valueOf()).format('h:mm a')
        };
};


module.exports = { generateMessage, generateLocationMessage };