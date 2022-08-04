const {
  createServer
} = require('http')

const {
  classLog,
  responseTimeTracker
} = require('./decorator')
const {
  once
} = require('events')
const {
  randomUUID
} = require('crypto')
const Db = new Map()

const { setTimeout } = require('timers/promises')
class Server {

  @responseTimeTracker
  async handler(req, res) {
    await setTimeout(parseInt(Math.random() * 100))
    if (req.method === 'POST') {
      const data = await once(req, 'data')
      const id = randomUUID()
      const item = JSON.parse(data)
      item.id = id
      
      Db.set(id, item)
      
      res.writeHead(201)
      res.end(JSON.stringify(item))
      return;
    }

    res.end(JSON.stringify( [...Db.values()]))
    return;

  }
}

createServer(new Server().handler).listen(3000, () => console.log('server running at 3000'))