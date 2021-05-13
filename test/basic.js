const async = require('async')
const test = require('tape')
const { Throttle, ThrottleGroup } = require('../')

const dataToSend = (() => {
  let str = ''
  const s = '0123456789xyzXYZ'
  for (let i = 0; i < 1000; i++) {
    str += s
  }
  return str
})()

const opts = {
  rate: 10 * 1000 // 100 KB/s
}

function testThrottle (throttle, cb) {
  let dataReceived = ''
  throttle.on('data', (chunk) => {
    dataReceived += chunk.toString()
  })
  throttle.on('end', () => {
    const isEqual = (dataToSend === dataReceived)
    cb(isEqual)
  })
  throttle.write(dataToSend, () => {
    throttle.end()
  })
}

test('Throttle must send the data', (t) => {
  t.plan(1)

  const throttle = new Throttle(opts)

  testThrottle(throttle, (ok) => {
    t.ok(ok, 'received string should equal sent string')
  })
})

test('Throttle from ThrottleGroup must send the data', (t) => {
  t.plan(3)

  const group = new ThrottleGroup(opts)

  async.each([1, 2, 3], () => {
    testThrottle(group.throttle(), (ok) => {
      t.ok(ok, 'received string should equal sent string')
    })
  }, (err) => {
    if (err) return t.error(err)
  })
})

test('Speed must be lower than the rate set', (t) => {
  t.plan(1)

  const throttle = new Throttle(opts)

  const before = Date.now()
  testThrottle(throttle, () => {
    const after = Date.now()
    const speed = dataToSend.length / ((after - before) / 1000)

    const lessThanRate = (speed <= opts.rate)
    t.ok(lessThanRate, 'speed should be less or equal to rate')
  })
})
