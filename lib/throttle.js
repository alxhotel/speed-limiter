const { Transform } = require('stream')
const ThrottleGroup = require('./throttle-group')

class Throttle extends Transform {
  constructor (opts = {}) {
    super()

    if (typeof opts !== 'object') throw new Error('Options must be an object')

    if (opts.group && !(opts.group instanceof ThrottleGroup)) throw new Error('Group must be an instanece of ThrottleGroup')
    else if (!opts.group) opts.group = new ThrottleGroup(opts)

    this.enabled = opts.enabled || opts.group.enabled
    this.group = opts.group
  }

  setEnabled (val) {
    this.enabled = val
  }

  _transform (chunk, _, done) {
    if (!this.enabled || !this.group.enabled) return this.push(chunk)
    this._processChunk(chunk, 0, done)
  }

  async _processChunk (chunk, pos, done) {
    const slice = chunk.slice(pos, pos + this.group.chunksize)
    if (!slice.length) return done()

    try {
      // Check here again because we might be in the middle of a big chunk
      if (this.enabled && this.group.enabled) await this.group.bucket.removeTokens(slice.length)
    } catch (err) {
      done(err)
    }

    this.push(slice)
    this._processChunk(chunk, pos + this.group.chunksize, done)
  }

  destroy (...args) {
    this.group._removeThrottle(this)

    super.destroy(...args)
  }
}

module.exports = Throttle
