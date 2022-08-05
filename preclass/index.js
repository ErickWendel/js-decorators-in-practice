const {
  createServer
} = require('http')

const {
  once
} = require('events')

const {
  randomUUID
} = require('crypto')

const {
  setTimeout
} = require('timers/promises')

const {
  route,
  responseTimeTracker
} = require('./decorator')

const Db = new Map()

class Server {

  @responseTimeTracker
  @route
  static async handler(req, res) {
    await setTimeout(parseInt(Math.random() * 100))

    if (req.method === 'POST') {
      const data = await once(req, 'data')

      const item = JSON.parse(data)
      item.id = randomUUID()

      Db.set(item.id, item)

      return {
        statusCode: 201,
        message: item
      };
    }

    return {
      statusCode: 200,
      message: [...Db.values()]
    }; 

  }
}

createServer(Server.handler)
  .listen(3000, () => console.log('server running at 3000'))