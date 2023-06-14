const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const WeekScema = new Schema({
    name: {type: String, default: "REG1"},
  });
  
  const Week = mongoose.model('week', WeekScema);

  module.exports = Week;