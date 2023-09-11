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
 * @path {POST} /api/pinecone/createEmbedding
 * @description Bussiness Logic :- In postIndex API, we are creating a new index in pinecone
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data - It will return the data.
 * @code {200} if the msg is success the api returns succcess message.
 * @author Bilal Sani, 20th April 2023
 * *** Last-Updated :- Bilal Sani, 20th April 2023 ***
 */
const validationSchema = {
  type: 'object',
  required: true,
  properties: { indexName: { type: 'string', required: true, minLength: 3 }, question: { type: 'string', required: true, minLength: 3 } }
}
const validation = (req, res, next) => {
  return validationOfAPI(req, res, next, validationSchema, 'body')
}
const createPrompt = async (req, res) => {
  try {
    const contexts = await Pinecone.getRelevantContexts(req.body.indexName, req.body.question)
    const prompt = await Pinecone.createPrompt(req.body.indexName, contexts.docContexts, req.body.question, contexts.queryEmbedding)
    res.sendJson({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: prompt })
  } catch (err) {
    return res.sendJson({
      type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
      err: err.err || err
    })
  }
}

router.post('/createPrompt', validation, createPrompt)
// router.post('/postPing', cache.route(100), validation, ping) // example for redis cache in routes
module.exports = router
