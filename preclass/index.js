const {
  createServer
} = require('http')
const {
  log,
  classLog,
  tracker
} = require('./decorator')
const {
  once
} = require('events')
const {
  randomUUID
} = require('crypto')
const Db = new Map()

// @classLog
class Request {
  constructor(a, b) {
    this.a = a
    this.b = b
  }

  // @log('hello')
  async getHeroes(id) {
    if (id) {
      const item = Db.get(id)
      return item;
    }

    return [...Db.values()]

  }

  // @log('hello')
  async saveHeroes(data) {
    const id = randomUUID()
    const item = JSON.parse(data)
    item.id = id

    Db.set(id, item)

    return item
    // return Promise.reject('ok')
  }

}

// ;
// (async () => {
//   const c = new Request(1, 2, 3, 4)
//   // C.p = 20
//   // C.x = 11
//   // C.x
//   console.log('r', await c.m(1, 2))
// })();

const request = new Request()

class Server {

  @tracker
  async handler(req, res) {
    if (req.method === 'POST') {
      const data = await once(req, 'data')
      const result = await request.saveHeroes(data)
      res.end(JSON.stringify(result))
      return;
    }
    
    const result = await request.getHeroes()
    res.end(JSON.stringify(result))
    return;

  }
}

createServer(new Server().handler).listen(3000, () => console.log('server running at 3000'))