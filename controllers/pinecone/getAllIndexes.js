const express = require('express')
const router = express.Router()
const __constants = require('../../config/constants')
const validationOfAPI = require('../../middlewares/validation')
const Pinecone = require('../../services/pinecone/pineconeMethods')
// const cache = require('../../middlewares/requestCacheMiddleware') // uncomment the statement whenever the redis cache is in use.

/**
 * @namespace -PINECONE-MODULE-
 * @description API’s related to PINECONE module.
 */
/**
 * @memberof -Pinecone-module-
 * @name postPing
 * @path {POST} /api/pinecone/getAllIndexes
 * @description Bussiness Logic :- In getAllIndexes API, we are getting list of all the indexes in pinecone
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data - It will return the data.
 * @code {200} if the msg is success the api returns succcess message.
 * @author Bilal Sani, 20th April 2023
 * *** Last-Updated :- Bilal Sani, 20th April 2023 ***
 */
const validationSchema = {

}
const validation = (req, res, next) => {
  return validationOfAPI(req, res, next, validationSchema, 'body')
}
const index = async (req, res) => {
  try {
    const indexes = await Pinecone.getAllIndexes()
    res.sendJson({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: indexes })
  } catch (err) {
    return res.sendJson({
      type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
      err: err.err || err
    })
  }
}

router.get('/getAllIndexes', validation, index)
// router.post('/postPing', cache.route(100), validation, ping) // example for redis cache in routes
module.exports = router
