const isUiDisabled = process.env.UI_DISABLED
let ui
if (isUiDisabled) {
  ui = {
    updateGraph: () => {}
  }
} else {
  const Ui = require('./ui')
  ui = new Ui()
}

const log = (...args) => {
  if (isUiDisabled) console.log(...args)
}
const {
  randomUUID
} = require('crypto')

function route(target, {
  kind,
  name,
}) {
  if (kind !== 'method') return target;

  return async function (request, response) {
    const {
      statusCode,
      message
    } = await target.apply(this, [request, response])

    response.writeHead(statusCode)
    response.end(JSON.stringify(message))
  }
}


function injectIfPromise({
  target,
  onFinally = () => {},
}) {

  target.finally?.(onFinally)

  return target
}

function responseTimeTracker(target, {
  kind,
  name,
}) {
  if (kind !== 'method') return target;

  const reqId = randomUUID()

  const trackerLast = {
    GET: performance.now(),
    POST: performance.now(),
  }
  return decorateExecution({
    reqId,
    target,
    name,
    trackerLast
  })
}

function decorateExecution({
  reqId,
  target,
  name,
  trackerLast
}) {

  return function (request, response) {
    const startTime = performance.now()
    const data = {
      reqId,
      name,
      method: request.method,
      url: request.url,
    }

    const afterExecution = target.apply(this, [request, response])

    return injectIfPromise({
      target: afterExecution,
      onFinally: onRequestEnded({
        data,
        response,
        startTime,
        trackerLast
      })
    })
  }
}

function onRequestEnded({
  data,
  response,
  startTime,
  trackerLast
}) {
  return () => {

    const endTime = performance.now()
    let timeDiff = endTime - startTime
    let seconds = Math.round(timeDiff)

    data.statusCode = response.statusCode
    data.statusMessage = response.statusMessage
    data.elapsed = timeDiff.toFixed(2).concat('ms')
    log('benchmark', data)

    //  simulating that we already made some calculations
    const trackerDiff = endTime - trackerLast[data.method]
    if (trackerDiff >= 200) {

      ui.updateGraph(
        data.method,
        seconds
      )
      trackerLast[data.method] = performance.now()
    }

  }
}

module.exports = {
  route,
  responseTimeTracker
}