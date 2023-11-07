const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
  {
    username: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('User', schema)
