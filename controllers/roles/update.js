const express = require('express')
const router = express.Router()
const __constants = require('../../config/constants')
const validationOfAPI = require('../../middlewares/validation')
const Role = require("../../services/roles/update")
// const cache = require('../../middlewares/requestCacheMiddleware') // uncomment the statement whenever the redis cache is in use.

/**
 * @namespace -ROLES-MODULE-
 * @description API’s related to ROLES module.
 */
/**
 * @memberof -ROLES-module-
 * @name update
 * @path {POST} /api/roles/update
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
        id: { type: 'string', required: true },
        role: { type: 'string', required: true }

    }
}
const validation = (req, res, next) => {
    return validationOfAPI(req, res, next, validationSchema, 'body')
}
const updateRole = async (req, res) => {
    try {
        const updateRole = await Role.updateRole(req.body)
        res.sendJson({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: updateRole })
    } catch (err) {
        return res.sendJson({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    }
}
router.post('/update', validation, updateRole)
// router.get('/getPing', cache.route(100), validation, ping) // example for redis cache in routes
module.exports = router
