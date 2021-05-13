const { TokenBucket } = require('limiter')
const Throttle = require('./throttle')

class ThrottleGroup {
  constructor (opts = {}) {
    if (typeof opts !== 'object') throw new Error('Options must be an object')

    this.throttles = []
    this.setEnabled(opts.enabled)
    this.setRate(opts.rate, opts.chunksize)
  }

  setEnabled (val = true) {
    if (typeof val !== 'boolean') throw new Error('Enabled must be a boolean')

    this.enabled = val
    for (const throttle of this.throttles) {
      throttle.enabled = val
    }
  }

  setRate (rate, chunksize = null) {
    if (typeof rate !== 'number') throw new Error('Rate must be a number')
    if (rate <= 0) throw new Error('Rate must be bigger than zero')
    if (chunksize && (typeof chunksize !== 'number' || chunksize <= 0)) throw new Error('Chunksize must be bigger than zero')
    if (chunksize > rate) throw new Error('Chunk size must be smaller than rate')

    if (!this.bucket) this.bucket = new TokenBucket(rate, rate, 'second', null)

    this.bucket.bucketSize = rate
    this.bucket.tokensPerInterval = rate
    this.chunksize = chunksize || Math.max(rate / 10, 1)
  }

  setChunksize (chunksize) {
    if (typeof chunksize !== 'number') throw new Error('Chunksize must be a number')
    if (chunksize <= 0) throw new Error('Chunksize must be bigger than zero')
    const rate = this.bucket.bucketSize
    if (chunksize > rate) throw new Error('Chunk size must be smaller than rate')
    this.chunksize = chunksize
  }

  throttle (opts = {}) {
    if (typeof opts !== 'object') throw new Error('Options must be an object')

    const newThrottle = new Throttle({
      ...opts,
      group: this
    })

    this.throttles.push(newThrottle)

    return newThrottle
  }

  destroy () {
    for (const throttle of this.throttles) {
      throttle.destroy()
    }

    this.throttles = []
  }

  _removeThrottle (throttle) {
    const index = this.throttles.indexOf(throttle)
    if (index > -1) this.throttles.splice(index, 1)
  }
}

module.exports = ThrottleGroup
