const test = require('tape')
const { Throttle } = require('../')

const opts = {
  rate: 10 * 1000 // 10 KB/s
}

test('Throttle must accept valid rate', (t) => {
  t.plan(4)

  const throttle = new Throttle(opts)

  t.doesNotThrow(() => {
    throttle.getGroup().setRate(120)
  })

  t.doesNotThrow(() => {
    throttle.getGroup().setRate(99999999)
  })

  t.doesNotThrow(() => {
    throttle.getGroup().setRate(0)
  })

  t.doesNotThrow(() => {
    throttle.getGroup().setRate(1)
  })
})

test('Throttle must throw if incorrect rate', (t) => {
  t.plan(8)

  const throttle = new Throttle(opts)

  t.throws(() => {
    throttle.getGroup().setRate('lala')
  })

  t.throws(() => {
    throttle.getGroup().setRate(Infinity)
  })

  t.throws(() => {
    throttle.getGroup().setRate('123')
  })

  t.throws(() => {
    throttle.getGroup().setRate(1.25)
  })

  t.throws(() => {
    throttle.getGroup().setRate(Math.PI)
  })

  t.throws(() => {
    throttle.getGroup().setRate(null)
  })

  t.throws(() => {
    throttle.getGroup().setRate(-1)
  })

  t.throws(() => {
    throttle.getGroup().setRate(-999999)
  })
})

test('Throttle must accept valid chunksize', (t) => {
  t.plan(3)

  const throttle = new Throttle(opts)

  t.doesNotThrow(() => {
    throttle.getGroup().setChunksize(120)
  })

  t.doesNotThrow(() => {
    throttle.getGroup().setChunksize(999)
  })

  t.doesNotThrow(() => {
    throttle.getGroup().setChunksize(1)
  })
})

test('Throttle must throw if incorrect chunksize', (t) => {
  t.plan(10)

  const throttle = new Throttle(opts)

  t.throws(() => {
    throttle.getGroup().setChunksize('lala')
  })

  t.throws(() => {
    throttle.getGroup().setChunksize(Inifnity)
  })

  t.throws(() => {
    throttle.getGroup().setChunksize('123')
  })

  t.throws(() => {
    throttle.getGroup().setChunksize(1.25)
  })

  t.throws(() => {
    throttle.getGroup().setChunksize(Math.PI)
  })

  t.throws(() => {
    throttle.getGroup().setChunksize(null)
  })

  t.throws(() => {
    throttle.getGroup().setChunksize(-1)
  })

  t.throws(() => {
    throttle.getGroup().setChunksize(-999999)
  })

  // Too big
  t.throws(() => {
    throttle.getGroup().setChunksize(99999999)
  })

  t.throws(() => {
    throttle.getGroup().setChunksize(0)
  })
})
