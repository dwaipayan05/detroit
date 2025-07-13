const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  password:   { type: String, required: true },
  dateCreated:{ type: Date,   default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
