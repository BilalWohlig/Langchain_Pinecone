const __constants = require('../../config/constants')
const { PineconeClient } = require('@pinecone-database/pinecone')
const pdfParse = require('pdf-parse')
const pinecone = new PineconeClient()
const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const { Document } = require('langchain/document')
pinecone
  .init({
    environment: process.env.PINECONE_ENV,
    apiKey: process.env.PINECONE_API_KEY
  })
  .then(() => {
    console.log('Pinecone Initialized')
  })
  .catch((error) => {
    console.log(error.message)
  })
class Pinecone {
  async indexCreate (index, dimension) {
    try {
      const index_name = index
      const existingIndex = await pinecone.listIndexes()
      if (!existingIndex.includes(index_name)) {
        const index = await pinecone.createIndex({
          createRequest: {
            name: index_name,
            dimension: dimension,
            metric: 'cosine',
            pods: 1,
            pod_type: 'p1.x1'
          }
        })
        return index
      }
      return await pinecone.describeIndex({
        indexName: existingIndex
      })
    } catch (err) {
      console.log('Error in indexCreate function :: err', err)
      throw new Error(err)
    }
  }

  async deleteAllVectorsFromNamespace(indexName, namespace) {
    try {
      const index = pinecone.Index(indexName)
      await index.delete1({
        namespace: namespace,
        deleteAll: true
      })
      return `Successfully Deleted All Vectors from Namespace ${namespace}`
    } catch (err) {
      console.log("Error in deleteAllVectorsFromNamespace::", err)
      throw err
    }

  }

  async getIndex (index_name) {
    try {
      const index = await pinecone.describeIndex({
        indexName: index_name
      })
      return index
    } catch (error) {
      console.log('Error in getIndex function :: err', err)
      throw new Error(err)
    }
  }

  async getAllIndexes () {
    try {
      const indexes = await pinecone.listIndexes()
      return indexes
    } catch (error) {
      console.log('Error in getAllIndexes function :: err', err)
      throw new Error(err)
    }
  }

  async createEmbeddingSingleDoc (file) {
    try {
      const data = await pdfParse(file)
      const newData = data.text.trim()
      const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: newData
      })
      return response.data.data[0].embedding
    } catch (err) {
      console.log(
        'Error in createEmbeddingSingleDoc function :: err',
        err.message
      )
      throw new Error(err)
    }
  }

  async sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getNumberOfVectorsInNamespace(index_name, namespace) {
    try {
      const index = pinecone.Index(index_name)
      const indexDescription = await index.describeIndexStats({
        describeIndexStatsRequest: {
          filter: {}
        }
      })
      if(!indexDescription) throw {
        type:  __constants.RESPONSE_MESSAGES.NOT_FOUND,
        err: "Failed to get index description"
      }
      let count = 0
      for (const key in indexDescription.namespaces) {
        if (key == namespace) {
          count = indexDescription.namespaces[key].vectorCount
          break
        }
      }
      return count
    } catch (err) {
      console.log("Error in getNumberOfVectorsInNamespace::", err)
      throw err
    }

  }

  async pushDataToPineconeIndex (
    index_name,
    documentData,
    vectorCount,
    namespace
  ) {
    try {
      let count = vectorCount
      const data = []
      let rawData
      let sizeLimit = 10485760
      if (documentData.size > sizeLimit) {
        throw {
          type:  __constants.RESPONSE_MESSAGES.File_SIZE_EXCEEDS,
          err: "File size exceeds the maximum limit of 10 MB"
        }
      }
      if (documentData.length != undefined) {
        for (let i = 0; i < documentData.length; i++) {
          const doc = documentData[i]
          rawData = await pdfParse(doc)
          const num = count + 1
          data.push({
            id: num.toString(),
            context: rawData.text.trim()
          })
          count = count + 1
        }
      } else {
        rawData = await pdfParse(documentData)
        const num = count + 1
        data.push(rawData.text.trim())
      }
      const index = pinecone.Index(index_name)
      const batch_size = 50
      const langchainContext = data.join(' ')
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 3000,
        chunkOverlap: 200
      })
      const docs = await splitter.splitDocuments([
        new Document({ pageContent: langchainContext })
      ])
      if (!docs) throw {
        type: __constants.RESPONSE_MESSAGES.NOT_FOUND,
        err: "Failed to split document"
      }
      docs.forEach((doc) => {
        const num = count + 1;
        doc.id = num.toString();
        count = count + 1;
      });
      for (let i = 0; i < docs.length; i += batch_size) {
        const i_end = Math.min(docs.length, i + batch_size)
        const meta_batch = docs.slice(i, i_end)
        const ids_batch = meta_batch.map((x) => x.id)
        const texts_batch = meta_batch.map((x) => x.pageContent)
        let response
        try {
          response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: texts_batch
          })
        } catch (error) {
          const done = false
          while (!done) {
            await this.sleep(5)
            try {
              response = await openai.createEmbedding({
                model: 'text-embedding-ada-002',
                input: texts_batch
              })
            } catch (error) {
              console.log(error.message)
            }
          }
        }
        const embeds = response.data.data.map((record) => record.embedding)
        const meta_batch_cleaned = meta_batch.map((x) => ({
          context: x.pageContent
        }))
        const to_upsert = ids_batch.map((id, i) => ({
          id: id,
          values: embeds[i],
          metadata: meta_batch_cleaned[i]
        }))
        const upsertRequest = {
          vectors: to_upsert,
          namespace: namespace
        }
        const upsertData = await index.upsert({ upsertRequest })
        if (!upsertData) throw {
          type: __constants.RESPONSE_MESSAGES.NOT_FOUND,
          err: "Failed to push data into pineconce"
        }
        return 'Successfully Uploaded'
      }
    } catch (err) {
      console.log('Error in pushDataToPineconeIndex::', err)
      throw err
    }
  }

  async getRelevantContexts (index_name, question, namespace) {
    try {
      const index = pinecone.Index(index_name)
      let response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: question
      })
      if(!response) throw {
        type:  __constants.RESPONSE_MESSAGES.NOT_FOUND,
        err: "Failed to create embeddings of question"
      }

      const xq = response.data.data[0].embedding
      response = await index.query({
        queryRequest: {
          namespace: namespace,
          vector: xq,
          topK: 5,
          includeMetadata: true,
          // includeValues: true
        }
      })
      
      const contexts = response.matches.map((match) => match.metadata.context)
      const clubContext = contexts.filter(function (str) {
        return str !== undefined;
      }).join('');
      return {
        queryEmbedding: xq,
        docContexts: clubContext,
        namespace: namespace
      }
    } catch (err) {
      console.log('Error in getRelevantContexts::', err)
      throw err
    }
  }

  async createPrompt (index_name, context, xq, namespace) {
    const index = pinecone.Index(index_name)
    const langchainContext = context.join(' ')
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    })
    const docs = await splitter.splitDocuments([
      new Document({ pageContent: langchainContext })
    ])
    let count = await this.getNumberOfVectorsInNamespace(index_name, namespace)
    docs.forEach((doc) => {
      const num = count + 1
      doc.id = num.toString()
      count = count + 1
    })
    const batch_size = 50
    for (let i = 0; i < docs.length; i += batch_size) {
      const i_end = Math.min(docs.length, i + batch_size)
      const meta_batch = docs.slice(i, i_end)
      const ids_batch = meta_batch.map((x) => x.id)
      const texts_batch = meta_batch.map((x) => x.pageContent)
      let response
      try {
        response = await openai.createEmbedding({
          model: 'text-embedding-ada-002',
          input: texts_batch
        })
      } catch (error) {
        const done = false
        while (!done) {
          await this.sleep(5)
          try {
            response = await openai.createEmbedding({
              model: 'text-embedding-ada-002',
              input: texts_batch
            })
          } catch (error) {
            console.log(error.message)
          }
        }
      }
      const embeds = response.data.data.map((record) => record.embedding)
      const meta_batch_cleaned = meta_batch.map((x) => ({
        pageContent: x.pageContent,
        sourceFrom: x.metadata.loc.lines.from,
        sourceTo: x.metadata.loc.lines.to
      }))
      const to_upsert = ids_batch.map((id, i) => ({
        id: id,
        values: embeds[i],
        metadata: meta_batch_cleaned[i]
      }))
      const upsertRequest = {
        vectors: to_upsert,
        namespace: namespace
      }
      await index.upsert({ upsertRequest })
      console.log('Done')
    }
    const relevantContextResponse = await index.query({
      queryRequest: {
        namespace: namespace,
        vector: xq,
        topK: 1,
        includeMetadata: true
        // includeValues: true
      }
    })
    const qnaContext = relevantContextResponse.matches[0].metadata.pageContent

    // const prompt_start = `Answer the question based on the context below.
    //     Context: ${prompt_middle}`;
    // const prompt_end = `Question: ${question}
    //     Answer:`;
    // const prompt = `${prompt_start}
    //     ${prompt_end}`;

    return qnaContext
  }

  async askChatGPT (context, question) {
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides information base on give context.'
          },
          {
            role: 'user',
            content: `Context: ${context}\nQuestion: ${question}`
          }
        ]
      })
      if(!response) throw {
        type:  __constants.RESPONSE_MESSAGES.NOT_FOUND,
        err: "Failed to get information form openai"
      }
      // const response = await openai.createCompletion({
      //   model: "text-davinci-003",
      //   prompt: `${prompt}`,
      //   max_tokens: 500,
      //   temperature: 0,
      //   top_p: 1,
      // });
      return response.data
    } catch (err) {
      throw err
    }
    
  }
}

module.exports = new Pinecone()
