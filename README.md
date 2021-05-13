# speed-limiter

[![NPM Version](https://img.shields.io/npm/v/speed-limiter.svg)](https://www.npmjs.com/package/speed-limiter)
[![Dependency Status](https://david-dm.org/alxhotel/speed-limiter/status.svg)](https://david-dm.org/alxhotel/speed-limiter)
[![Standard - Javascript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Throttle the speed of streams in NodeJS

## Installation

```sh
npm install speed-limiter
```

## Usage

```js
const { ThrottleGroup } = require('speed-limiter')

const rate = 200 * 1000 // 200 KB/s
const throttleGroup = new ThrottleGroup({ rate })
```

## API

#### `const throttle = new Throttle()`

Initialize the throttle instance.

#### `const throttleGroup = new ThrottleGroup()`

Initialize the throttle group.

TODO: add rest of methods

## License

MIT. Copyright (c) [Alex](https://github.com/alxhotel)
