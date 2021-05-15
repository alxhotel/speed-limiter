const async = require('async')
const test = require('tape')
const { Throttle, ThrottleGroup } = require('../')

const { getRandomData, testThrottle } = require('./common')

const opts = {
  rate: 10 * 1000 // 10 KB/s
}

test('Throttle must send the data', (t) => {
  t.plan(1)

  const dataToSend = getRandomData()
  const throttle = new Throttle(opts)

  testThrottle(dataToSend, throttle, (data) => {
    t.ok(dataToSend.equals(data), 'data received should equal data sent')

    throttle.destroy()
  })
})

test('Throttle from ThrottleGroup must send the data', (t) => {
  t.plan(3)

  const dataToSend = getRandomData()
  const group = new ThrottleGroup(opts)

  async.each([1, 2, 3], () => {
    const throttle = group.throttle()

    testThrottle(dataToSend, group.throttle(), (data) => {
      t.ok(dataToSend.equals(data), 'data received should equal data sent')

      throttle.destroy()
    })
  }, (err) => {
    if (err) return t.error(err)
  })
})
