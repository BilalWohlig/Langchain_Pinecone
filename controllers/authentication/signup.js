const express = require('express')
const router = express.Router()
const __constants = require('../../config/constants')
const validationOfAPI = require('../../middlewares/validation')
const Register = require('../../services/userAuthentication/signup')

/**
 * @namespace -Authentication-
 * @description API’s related to Authentication module.
 */
/**
 * @memberof -Authentication-module-
 * @name signup
 * @path {POST} /api/authentication/signup
 * @description Business Logic :- In signup API, we are registering new user.
 * @params
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data - It will return the data.
 * @code {200} if the msg is success the api returns success message.
 * @author Rahul pal, 30th October 2023
 * *** Last-Updated :- Rahul Pal, 30th October 2023 ***
 */
const validationSchema = {
  type: 'object',
  required: true,
  properties: {
    username: { type: 'string', required: true },
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true }

  }
}

const validation = async (req, res, next) => {
  return validationOfAPI(req, res, next, validationSchema, 'body')
}

const registerUser = async (req, res) => {
  try {
    const response = await Register.signupUser(req.body)
    res.sendJson({
      type: __constants.RESPONSE_MESSAGES.SUCCESS,
      data: response
    })
  } catch (err) {
    return res.sendJson({
      type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
      err: err.err || err
    })
  }
}
router.post('/signup', validation, registerUser)
module.exports = router
