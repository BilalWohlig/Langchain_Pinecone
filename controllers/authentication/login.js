const express = require('express')
const router = express.Router()
const __constants = require('../../config/constants')
const validationOfAPI = require('../../middlewares/validation')
const Login = require('../../services/userAuthentication/login')

/**
 * @namespace -Authentication-
 * @description API’s related to Authentication module.
 */
/**
 * @memberof -Authentication-module-
 * @name login
 * @path {POST} /api/authentication/login
 * @description Business Logic :- In login API, we are logging in a user.
 * @params
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data - It will return the data.
 * @code {200} if the msg is success the api returns success message.
 * @author Rahul pal, 31th October 2023
 * *** Last-Updated :- Rahul Pal, 31th October 2023 ***
 */
const validationSchema = {
  type: 'object',
  required: true,
  properties: {
    email: { type: 'string', required: true },
    password: { type: 'string', required: true }
  }
}
const validation = async (req, res, next) => {
  return validationOfAPI(req, res, next, validationSchema, 'body')
}

const loginUser = async (req, res) => {
  try {
    const response = await Login.loginUser(req.body)
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
router.post(
  '/login',
  validation,
  loginUser
)
module.exports = router
