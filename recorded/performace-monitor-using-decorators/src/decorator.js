const {
  randomUUID
} = require('crypto')

function route(target, {
  kind,
  name
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

function responseTimeTracker(target, {
  kind,
  name
}) {
  if (kind !== 'method') return target;

  return function (request, response) {
    const reqId = randomUUID()
    const requestStartedAt = performance.now()
    const methodsTimeTracker = {
      GET: performance.now(),
      POST: performance.now(),
    }
    // console.time('benchmark')
    const afterExecution = target.apply(this, [request, response])
    const data = {
      reqId,
      name,
      method: request.method,
      url: request.url
    }

    // afterExecution.finally(_ => {
    //   console.timeEnd('benchmark')
    // })
    const onFinally = onRequestEnded({
      data,
      response,
      requestStartedAt,
      methodsTimeTracker
    })

    // assuming it'll always be a promise object
    afterExecution.finally(onFinally)
    return afterExecution
  }
}

function onRequestEnded({
  data,
  response,
  requestStartedAt,
  methodsTimeTracker
}) {
  return () => {
    const requestEndedAt = performance.now()
    let timeDiff = requestEndedAt - requestStartedAt
    let seconds = Math.round(timeDiff)

    data.statusCode = response.statusCode
    data.statusMessage = response.statusMessage
    data.elapsed = timeDiff.toFixed(2).concat('ms')
    log('benchmark', data)
    //  simulationg that we already made some calculations or spawned the process in another one
    const trackerDiff = requestEndedAt - methodsTimeTracker[data.method]
    if (trackerDiff >= 200) {

      ui.updateGraph(
        data.method,
        seconds
      )
      methodsTimeTracker[data.method] = performance.now()
    }
  }
}

module.exports = {
  route,
  responseTimeTracker
}