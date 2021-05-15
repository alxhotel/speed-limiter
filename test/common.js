module.exports = {
  getRandomData,
  testThrottle
}

function getRandomData () {
  let str = ''
  const s = '0123456789xyzXYZ'
  for (let i = 0; i < 1000; i++) {
    str += s
  }
  return Buffer.from(str)
}

function testThrottle (dataToSend, throttle, cb) {
  let dataReceived
  throttle.on('data', (chunk) => {
    if (dataReceived) dataReceived = Buffer.concat([dataReceived, chunk])
    else dataReceived = chunk
  })
  throttle.on('end', () => {
    const after = Date.now()
    const time = ((after - before) / 1000)
    const speed = dataToSend.length / time
    cb(dataReceived, speed)
  })

  // Start stream
  const before = Date.now()
  throttle.write(dataToSend)
  throttle.end()
}
