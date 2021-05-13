const { Transform } = require('stream')

class Throttle extends Transform {
  constructor (opts = {}) {
    super()

    if (typeof opts !== 'object') throw new Error('Options must be an object')

    const params = Object.assign({}, opts)

    if (params.group && !(params.group instanceof ThrottleGroup)) throw new Error('Group must be an instanece of ThrottleGroup')
    else if (!params.group) params.group = new ThrottleGroup(params)

    this.enabled = params.enabled || params.group.enabled
    this.group = params.group
  }

  setEnabled (val) {
    this.enabled = val
  }

  _transform (chunk, _, done) {
    if (!this.enabled || !this.group.enabled) return this.push(chunk)
    this._processChunk(chunk, done)
  }

  async _processChunk (chunk, done) {
    let pos = 0
    let slice = chunk.slice(0, this.group.chunksize)
    while (slice.length) {
      try {
        // Check here again because we might be in the middle of a big chunk
        if (this.enabled && this.group.enabled) {
          await new Promise((resolve, reject) => {
            this.group.bucket.removeTokens(slice.length, (err) => {
              if (err) return reject(err)
              resolve()
            })
          })
        }
      } catch (err) {
        return done(err)
      }

      this.push(slice)
      pos += this.group.chunksize
      slice = chunk.slice(pos, pos + this.group.chunksize)
    }

    return done()
  }

  destroy (...args) {
    this.group._removeThrottle(this)

    super.destroy(...args)
  }
}

module.exports = Throttle

// Fix circular dependency
const ThrottleGroup = require('./throttle-group')
