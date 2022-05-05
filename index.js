module.exports = async options => {
  let index = 0
  let error = false
  let seekResolve
  let extractOffsets = false

  const frames = []

  const isNumber = n => {
    return +n + '' === n + ''
  }

  const isTimestamp = timestamp => {
    return isNumber(timestamp) && +timestamp >= 0 && +timestamp <= video.duration
  }

  const isPrototypeOf = (constructor, value) => {
    return (value instanceof constructor)
  }

  const fallbackToDefault = (property, defaultValue) => {
    options[property] = hasOwnProperty.call(options, property) ? options[property] : defaultValue
  }

  const hasOwnProperty = Object.prototype.hasOwnProperty

  // Buffer Video Element
  const video = document.createElement('video')
  video.src = options.url
  video.crossOrigin = 'anonymous'
  video.onseeked = async () => {
    if (seekResolve) { seekResolve() }
  }
  video.onerror = () => {
    error = true
  }

  while ((video.duration === Infinity || isNaN(video.duration)) && video.readyState < 2) {
    await new Promise(resolve => setTimeout(resolve, 100))
    video.currentTime = 10000000 * Math.random()
    if (error) { break }
  }

  // Set options to default values if not set
  fallbackToDefault('format', 'image/png')
  fallbackToDefault('offsets', [])
  fallbackToDefault('startTime', 0)
  fallbackToDefault('endTime', video.duration)
  fallbackToDefault('count', 1)
  fallbackToDefault('onLoad', false)
  fallbackToDefault('onProgress', false)

  // Filter out invalid offsets
  if (!isPrototypeOf(Array, options.offsets)) { options.offsets = [] } else {
    options.offsets = options.offsets.filter(offset => {
      return isTimestamp(offset)
    })
  }

  if (options.offsets.length !== 0) { extractOffsets = true }

  // Check if start and end times are valid
  if (!isTimestamp(options.startTime)) { options.startTime = 0 }

  if (!isTimestamp(options.endTime)) { options.endTime = video.duration }

  if (options.startTime >= options.endTime) {
    options.startTime = options.endTime
    options.count = 1
  }

  // Float values
  options.startTime = +options.startTime
  options.endTime = +options.endTime

  // Convert count value to a positive integer (floor() or 0 if string)
  options.count = Math.abs(~~options.count)
  if (options.count === 0) { options.count = 1 }
  if (extractOffsets) { options.count = options.offsets.length }

  // Starting at startTime and ending at endTime - interval
  const interval = (options.endTime - options.startTime) / options.count

  // Set Width and Height
  let isWidthSet = hasOwnProperty.call(options, 'width')
  let isHeightSet = hasOwnProperty.call(options, 'height')
  const videoDimensionRatio = video.videoWidth / video.videoHeight

  // Reset Width and Height if not valid
  if (isWidthSet && !isNumber(options.width)) { isWidthSet = false }

  if (isHeightSet && !isNumber(options.height)) { isHeightSet = false }

  if (!isWidthSet && !isHeightSet) {
    // Both Width and Height not set
    options.width = 128 // Default Value (randomly set)
    options.height = options.width / videoDimensionRatio
  } else if (isWidthSet && !isHeightSet) {
    // Width set but Height not set
    options.height = options.width / videoDimensionRatio
  } else if (!isWidthSet && isHeightSet) {
    // Height set but Width not set
    options.width = options.height * videoDimensionRatio
  }

  // Float values
  options.width = +options.width
  options.height = +options.height

  // Reset onLoad and onProgress functions if not valid
  if (!isPrototypeOf(Function, options.onLoad)) { options.onLoad = false }

  if (!isPrototypeOf(Function, options.onProgress)) { options.onProgress = false }

  if (options.onLoad) { options.onLoad() }

  // Buffer Canvas Element
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = options.width
  canvas.height = options.height

  const extract = async resolve => {
    while (index < options.count) {
      video.currentTime = extractOffsets ? options.offsets[index] : options.startTime + index * interval
      await new Promise(resolve => { seekResolve = resolve })
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      frames.push({
        offset: video.currentTime,
        image: canvas.toDataURL(options.format)
      })
      index++
      if (options.onProgress) { options.onProgress(index, options.count) }
    }
    resolve(frames)
  }

  return new Promise(resolve => {
    if (error) { resolve([]) }

    extract(resolve)
  })
}
