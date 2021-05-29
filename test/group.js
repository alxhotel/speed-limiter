const test = require('tape')
const { ThrottleGroup } = require('../')

test('Different values of rate and chunksize', (t) => {
  t.plan(8)

  const group = new ThrottleGroup({
    rate: 0,
    enabled: false
  })

  t.equal(group.getRate(), 0)
  t.equal(group.getChunksize(), 1)

  group.setEnabled(true)

  t.equal(group.getRate(), 0)
  t.equal(group.getChunksize(), 1)

  const newRate = 100 * 1000
  group.setRate(newRate)

  t.equal(group.getRate(), newRate)
  t.equal(group.getChunksize(), newRate / 10)

  group.setEnabled(false)

  t.equal(group.getRate(), newRate)
  t.equal(group.getChunksize(), newRate / 10)
})
