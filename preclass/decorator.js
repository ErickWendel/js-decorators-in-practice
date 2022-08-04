const {
  appendFile
} = require('fs/promises')


const {
  randomUUID
} = require('crypto')

const requests = new Map()
const logger = `logger.log`

// function log(name) {
//   return function decorator(t, n, descriptor) {
//     const original = descriptor.value;
//     if (typeof original !== 'function')
//       return descriptor;

//     descriptor.value = function (...args) {
//       console.log(`Arguments for ${name}: ${args}`);
//       try {
//         console.time('benchmarking')
//         const result = original.apply(this, args);
//         console.log(`Result from ${name}: ${result}`);

//         return injectIfPromise({
//           target: result,
//           onFinally: () => console.timeEnd('benchmarking')
//         })

//       } catch (e) {
//         console.log(`Error from ${name}: ${e}`);
//         throw e;
//       }
//     }

//     return descriptor
//   };
// }

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

function tracker(t, n, descriptor) {
  const original = descriptor.value;
  if (typeof original !== 'function')
    return descriptor;

  const reqId = randomUUID()

  descriptor.value = function (request, response) {
    const data = {
      reqId,
      method: request.method,
      url: request.url,
      name: 'test',
    }
    console.log('data', data)
    console.time('benchmarking')

    const result = original.apply(this, [request, response]);

    return injectIfPromise({
      target: result,
      onFinally: () => {
        console.timeEnd('benchmarking')
      }
    })
  }

  return descriptor
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
  tracker
}