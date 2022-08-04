const {
  appendFile
} = require('fs/promises')

const {
  initialize,
  updateGraph
} = require('./ui')

initialize()

const {
  randomUUID
} = require('crypto')

const requests = new Map()
const logger = `logger.log`

function injectIfPromise({
  target,
  onFinally = () => {},
  onErr = () => {},
  onSuccess = () => {}
}) {
  if (!target.then) return target

  target
    .then(onSuccess)
    .catch(onErr)
    .finally(onFinally)

  return target
}

function responseTimeTracker(t, n, descriptor) {
  const original = descriptor.value;
  if (typeof original !== 'function')
    return descriptor;

  const reqId = randomUUID()

  const trackerLast = {
    GET: performance.now(),
    POST: performance.now(),
  }
  descriptor.value = decorateExecution(
    reqId,
    original,
    trackerLast
  )

  return descriptor
}

function decorateExecution(reqId, original, trackerLast) {

  return function (request, response) {
    const startTime = performance.now()
    const data = {
      reqId,
      method: request.method,
      url: request.url,
      name: 'test',
    }
    // console.time('benchmarking')
    const result = original.apply(this, [request, response])

    return injectIfPromise({
      target: result,
      onFinally: onRequestEnded(data, response, startTime, trackerLast)
    })
  }
}

function onRequestEnded(data, response, startTime, trackerLast) {
  return () => {
    
    const endTime = performance.now()
    let timeDiff = endTime - startTime //in ms
    let seconds = Math.round(timeDiff)

    // data.statusCode = response.statusCode
    // data.statusMessage = response.statusMessage
    // data.elapsed = seconds
    // console.log('benchmark', data)

    //  simulating that we already made some calculations
    const trackerDiff = endTime - trackerLast[data.method]
    if (trackerDiff >= 200) {

      updateGraph(
        data.method,
        seconds
      )
      trackerLast[data.method] = performance.now()
    }

  }
}

function classLog(target) {
  const isClass = target.toString().includes('class')
  if (!isClass) throw new Error('this decorator is meant for classes!')

  const newClass = class extends target {
    constructor(...args) {
      super(...args);
      console.log(`constructing a class with arguments: ${args.join(", ")}`);
    }
  }
  console.log(`An instance of the ${target.name} ${isClass} has been created`)
  return newClass;
}

module.exports = {
  // log,
  classLog,
  responseTimeTracker
}