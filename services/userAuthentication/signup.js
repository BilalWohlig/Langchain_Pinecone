const authentication = require('../../middlewares/auth/authentication')
const __constants = require('../../config/constants')
const User = require('../../mongooseSchema/User')
const Role = require('../../mongooseSchema/Role')
const bcrypt = require('bcrypt')

class signup {
  async signupUser(body) {
    try {
      const isUser = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] })
      if (isUser) {
        throw {
          type: __constants.RESPONSE_MESSAGES.ALREADY_EXISTS,
          err: 'User with username or email already exists'
        }
      }
      const salt = await bcrypt.genSalt(10)
      const password = await bcrypt.hash(body.password, salt)
      const role = await Role.findOne({role: "user"})
      if(!role){
        throw {
          type: __constants.RESPONSE_MESSAGES.NOT_FOUND,
          err: 'Failed to get role'
        }
      }
      const userObj = {
        username: body.username,
        email: body.email,
        password: password,
        firstName: body.firstName,
        lastName: body.lastName,
        role: role._id
      }
      const newUser = new User(userObj)
      await newUser.save()
      userObj.id = newUser._id
      const token = authentication.setToken(userObj, 86400)
      return {
        user: newUser,
        token: token
      }
    } catch (err) {
      throw err
    }
  }
}

module.exports = new signup()
