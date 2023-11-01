const User = require('../../mongooseSchema/User')
const authentication = require('../../middlewares/auth/authentication')
const bcrypt = require('bcrypt')
const __constants = require('../../config/constants')

class login {
  async loginUser (body) {
    try {
      const isUser = await User.findOne({ email: body.email })
      if (!isUser) {
        const error = {
          type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST,
          err: 'Email not found'
        }
        throw error
      }
      const validPassword = await bcrypt.compare(
        body.password,
        isUser.password
      )
      if (!validPassword) {
        const error = {
          type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST,
          err: 'Password does no match'
        }
        throw error
      }
      const userObj = {
        name: isUser.name,
        mobile: isUser.mobile,
        email: isUser.email,
        id: isUser._id
      }
      const token = authentication.setToken(userObj, 86400)
      return {
        user: userObj,
        token: token
      }
    } catch (err) {
      throw err
    }
  }
}

module.exports = new login()
