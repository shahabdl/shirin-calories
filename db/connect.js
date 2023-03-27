const mongoose = require('mongoose');

const ConnectDB = (url) => {
    return mongoose.connect(url,{
        useNewUrlParser:true,
        useUnifiedTopology: true,
    }).then(console.log(mongoose.connection.readyState));
}

module.exports = ConnectDB;