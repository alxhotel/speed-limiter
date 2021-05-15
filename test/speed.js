const test = require('tape')
const { Throttle } = require('../')

const { getRandomData, testThrottle } = require('./common')

const opts = {
  rate: 10 * 1000 // 10 KB/s
}

test('Speed must be lower than the rate set', (t) => {
  t.plan(1)

  const dataToSend = getRandomData()
  const throttle = new Throttle(opts)

  testThrottle(dataToSend, throttle, (_, speed) => {
    const lessThanRate = (speed <= opts.rate)
    t.ok(lessThanRate, 'speed should be less or equal to rate')

    throttle.destroy()
  })
})

test('Speed must be higher than 10 KB/s, when disabled and rate = 0', (t) => {
  t.plan(1)

  const dataToSend = getRandomData()
  const throttle = new Throttle({
    rate: 0,
    enabled: false
  })

  testThrottle(dataToSend, throttle, (_, speed) => {
    const lessThanRate = (speed >= 10 * 1000)
    t.ok(lessThanRate, 'speed should be more than 10 KB/s')

    throttle.destroy()
  })
})

test('Speed must be higher than 10 KB/s, when disabled and rate is > 0', (t) => {
  t.plan(1)

  const dataToSend = getRandomData()
  const throttle = new Throttle({
    rate: 100,
    enabled: false
  })

  testThrottle(dataToSend, throttle, (_, speed) => {
    const lessThanRate = (speed >= 10 * 1000)
    t.ok(lessThanRate, 'speed should be more than 10 KB/s')

    throttle.destroy()
  })
})

test('Throttle should block everything if rate is zero', (t) => {
  t.plan(3)

  const dataToSend = getRandomData()
  const throttle = new Throttle({
    rate: 0,
    enabled: true
  })

  let order = 0

  testThrottle(dataToSend, throttle, (data) => {
    t.ok(dataToSend.equals(data), 'data received equals data sent')
    t.equal(++order, 2)
    throttle.destroy()
  })

  setTimeout(() => {
    t.equal(++order, 1)
    const group = throttle.getGroup()
    group.setRate(10 * 1000)
  }, 2000)
})
