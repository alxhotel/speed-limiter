const { Transform } = require('stream')
const { wait } = require('./utils')

class Throttle extends Transform {
  constructor (opts = {}) {
    super()

    if (typeof opts !== 'object') throw new Error('Options must be an object')

    const params = Object.assign({}, opts)

    if (params.group && !(params.group instanceof ThrottleGroup)) throw new Error('Group must be an instanece of ThrottleGroup')
    else if (!params.group) params.group = new ThrottleGroup(params)

    this.enabled = params.enabled || params.group.enabled
    this.group = params.group

    this._destroyed = false
  }

  setEnabled (val) {
    this.enabled = val
  }

  _transform (chunk, _, done) {
    if (!this.enabled || !this.group.enabled) return done(null, chunk)
    this._processChunk(chunk, done)
  }

  async _processChunk (chunk, done) {
    let pos = 0
    let slice = chunk.slice(pos, pos + this.group.chunksize)
    while (slice.length) {
      try {
        // Check here again because we might be in the middle of a big chunk
        if (this.enabled && this.group.enabled) {
          // Stop pushing chunks if rate is zero
          while (this.group.getRate() === 0) {
            await wait(1 * 1000) // wait 1 second
            if (this._destroyed) return
          }

          await new Promise((resolve, reject) => {
            this.group.bucket.removeTokens(slice.length, (err) => {
              if (err) return reject(err)
              resolve()
            })
          })

          if (this._destroyed) return
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

    this._destroyed = true

    super.destroy(...args)
  }
}

module.exports = Throttle

// Fix circular dependency
const ThrottleGroup = require('./throttle-group')
