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
    indexName: { type: 'string', required: true, minLength: 3, maxLength:50 },
    namespace: { type: 'string', required: true, minLength: 3, maxLength:50 }
  }
}
const validation = (req, res, next) => {
  return validationOfAPI(req, res, next, validationSchema, 'body')
}
const pushData = async (req, res) => {
  try {
    if(!req.files) throw {type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, err: 'No file uploaded' }
    const namespaceVectorCount = await Pinecone.getNumberOfVectorsInNamespace(req.body.indexName, req.body.namespace)
    const data = await Pinecone.pushDataToPineconeIndex(req.body.indexName, req.files.pdfFiles, namespaceVectorCount, req.body.namespace)
    res.sendJson({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
  } catch (err) {
    return res.sendJson({
      type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR,
      err: err.err || err
    })
  }
}

router.post('/pushDataToPineconeIndex',
  authorize.authenticate("jwt", { session: false }),
  validation, pushData)
// router.post('/postPing', cache.route(100), validation, ping) // example for redis cache in routes
module.exports = router
