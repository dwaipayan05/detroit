const mongoose = require('mongoose');
require('dotenv').config();

const dbConn = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = dbConn;