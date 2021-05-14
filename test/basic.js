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
  rate: 10 * 1000 // 10 KB/s
}

function testThrottle (throttle, cb) {
  let dataReceived = ''
  throttle.on('data', (chunk) => {
    dataReceived += chunk.toString()
  })
  throttle.on('end', () => {
    const isEqual = (dataToSend === dataReceived)
    const after = Date.now()
    const speed = dataToSend.length / ((after - before) / 1000)
    cb(isEqual, speed)
  })

  const before = Date.now()
  throttle.write(dataToSend, () => {
    throttle.end()
  })
}

test('Throttle must send the data', (t) => {
  t.plan(1)

  const throttle = new Throttle(opts)

  testThrottle(throttle, (ok) => {
    t.ok(ok, 'received string should equal sent string')

    throttle.destroy()
  })
})

test('Throttle from ThrottleGroup must send the data', (t) => {
  t.plan(3)

  const group = new ThrottleGroup(opts)

  async.each([1, 2, 3], () => {
    const throttle = group.throttle()

    testThrottle(group.throttle(), (ok) => {
      t.ok(ok, 'received string should equal sent string')

      throttle.destroy()
    })
  }, (err) => {
    if (err) return t.error(err)
  })
})

test('Speed must be lower than the rate set', (t) => {
  t.plan(1)

  const throttle = new Throttle(opts)

  testThrottle(throttle, (_, speed) => {
    const lessThanRate = (speed <= opts.rate)
    t.ok(lessThanRate, 'speed should be less or equal to rate')

    throttle.destroy()
  })
})

test('Speed must be higher than 10 KB/s, when disabled and rate = 0', (t) => {
  t.plan(1)

  const throttle = new Throttle({
    rate: 0,
    enabled: false
  })

  testThrottle(throttle, (_, speed) => {
    const lessThanRate = (speed >= 10 * 1000)
    t.ok(lessThanRate, 'speed should be more than 10 KB/s')

    throttle.destroy()
  })
})

test('Speed must be higher than 10 KB/s, when disabled and rate is > 0', (t) => {
  t.plan(1)

  const throttle = new Throttle({
    rate: 100,
    enabled: false
  })

  testThrottle(throttle, (_, speed) => {
    const lessThanRate = (speed >= 10 * 1000)
    t.ok(lessThanRate, 'speed should be more than 10 KB/s')

    throttle.destroy()
  })
})

test('Throttle should block everything if rate is zero', (t) => {
  const throttle = new Throttle({
    rate: 0,
    enabled: true
  })

  testThrottle(throttle, () => {
    t.fail('throttle has not block all chunks')
  })

  setTimeout(() => {
    throttle.destroy()
    t.pass('throttle has block all chunks')
    t.end()
  }, 2000)
})
