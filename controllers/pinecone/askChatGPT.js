const express = require('express')
const router = express.Router()
const __constants = require('../../config/constants')
const validationOfAPI = require('../../middlewares/validation')
const Pinecone = require('../../services/pinecone/pineconeMethods')
const authorize = require('../../middlewares/auth/authentication')

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
  additionalProperties: false,
  properties: {
    indexName: { type: 'string', required: true, minLength: 3, maxLength:30  },
    question: { type: 'string', required: true, minLength: 3, },
    namespace: { type: 'string', required: true, minLength: 3, maxLength:30  }
  }
}
const validation = (req, res, next) => {
  return validationOfAPI(req, res, next, validationSchema, 'body')
}
const askChatGPT = async (req, res) => {
  try {
    const contexts = await Pinecone.getRelevantContexts(
      req.body.indexName,
      req.body.question,
      req.body.namespace
    )
    
    const data = await Pinecone.askChatGPT(contexts.docContexts, req.body.question)
    const answer = data.choices[0].message.content
    res.sendJson({
      type: __constants.RESPONSE_MESSAGES.SUCCESS,
      data: answer.trim()
    })
  } catch (err) {
    return res.sendJson({
      type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
      err: err.err || err
    })
  }
}

router.post('/askChatGPT',
  authorize.authenticate("jwt", { session: false }),
  validation, askChatGPT)
// router.post('/postPing', cache.route(100), validation, ping) // example for redis cache in routes
module.exports = router
