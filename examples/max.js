const NullDuplexStream = require('null-duplex-stream')
const randomBytesReadableStream = require('random-bytes-readable-stream')
const speedometer = require('speedometer')
const { Transform } = require('streamx')
const { Throttle } = require('../')

const nullstream = new NullDuplexStream()

// Test with very high limit
const opts = {
  rate: 734003200 // 700 MB/s
  // rate: 0,
  // enabled: false
}

const throttle = new Throttle(opts)

const getSpeed = speedometer()

randomBytesReadableStream({
  size: (1024 * 1024 * 1024) * 100 // 100 GB
})
  .pipe(throttle)
  .pipe(new Transform({
    transform: (chunk, done) => {
      const speed = getSpeed(chunk.length)
      console.log(speed)

      done(null, chunk)
    }
  }))
  // .pipe(process.stderr)
  .pipe(nullstream)
