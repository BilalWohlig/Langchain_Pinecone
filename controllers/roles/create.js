const express = require('express')
const router = express.Router()
const __constants = require('../../config/constants')
const validationOfAPI = require('../../middlewares/validation')
const Role = require("../../services/roles/create")
// const cache = require('../../middlewares/requestCacheMiddleware') // uncomment the statement whenever the redis cache is in use.

/**
 * @namespace -ROLES-MODULE-
 * @description API’s related to ROLES module.
 */
/**
 * @memberof -ROLES-module-
 * @name create
 * @path {POST} /api/roles/create
 * @description Business Logic :- In create role API, we are just returning the success response and data true.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data - It will return the data.
 * @code {200} if the msg is success the api returns success message.
 * @author Rahul Pal, 7th November 2023
 * *** Last-Updated :- Rahul Pal, 7th November 2023 ***
 */
const validationSchema = {
    type: 'object',
    required: true,
    properties: {
        role: { type: 'string', required: true }
    }
}
const validation = (req, res, next) => {
    return validationOfAPI(req, res, next, validationSchema, 'body')
}
const createRole = async (req, res) => {
    try {
        const newRole = await Role.newRole(req.body)
        res.sendJson({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: true })
    } catch (err) {
        return res.sendJson({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    }
}
router.post('/create', validation, createRole)
// router.get('/getPing', cache.route(100), validation, ping) // example for redis cache in routes
module.exports = router
