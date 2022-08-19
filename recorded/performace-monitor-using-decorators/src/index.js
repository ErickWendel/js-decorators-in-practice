const {
  once
} = require('events')
const {
  createServer
} = require('http')
const {
  randomUUID
} = require('crypto')
const {
  route,
  responseTimeTracker
} = require('./decorator')
const { setTimeout } = require('timers/promises')
const Db = new Map();
class Server {
  @responseTimeTracker
  @route // must be first because it changes the response data
  static async handler(request, response) {
    await setTimeout(parseInt(Math.random() * 100))
    
    if (request.method === "POST") {
      const data = await once(request, "data")
      const item = JSON.parse(data)
      item.id = randomUUID()

      Db.set(item.id, item)
      return {
        statusCode: 201,
        message: item
      }

    }
    return {
      statusCode: 200,
      message: [...Db.values()]
    }
  }
}

createServer(Server.handler)
  .listen(3000, () => console.log('server is running at 3000'))