module.exports = async options => {
  let index = 0
  let error = false
  let seekResolve
  let extractOffsets = false

  // For minification

  // Options
  const _call = 'call'
  const _count = 'count'
  const _width = 'width'
  const _height = 'height'
  const _length = 'length'
  const _format = 'format'
  const _onLoad = 'onLoad'
  const _offsets = 'offsets'
  const _endTime = 'endTime'
  const _duration = 'duration'
  const _startTime = 'startTime'
  const _onProgress = 'onProgress'
  const _currentTime = 'currentTime'
  const _createElement = 'createElement'

  const frames = []

  const isNumber = n => {
    return +n + '' === n + ''
  }

  const isTimestamp = timestamp => {
    return isNumber(timestamp) && +timestamp >= 0 && +timestamp <= video[_duration]
  }

  const isPrototypeOf = (constructor, value) => {
    return (value instanceof constructor)
  }

  const fallbackToDefault = (property, defaultValue) => {
    options[property] = hasOwnProperty[_call](options, property) ? options[property] : defaultValue
  }

  const hasOwnProperty = {}.hasOwnProperty

  // Buffer Video Element
  const video = document[_createElement]('video')
  video.src = options.url
  video.crossOrigin = 'anonymous'
  video.onseeked = async () => {
    if (seekResolve) { seekResolve() }
  }
  video.onerror = () => {
    error = true
  }

  while ((video[_duration] === Infinity || isNaN(video[_duration])) && video.readyState < 2) {
    await new Promise(resolve => setTimeout(resolve, 100))
    video[_currentTime] = 10000000 * Math.random()
    if (error) { break }
  }

  // Set currentTime to duration / 2
  // (fix for correctly invoking onseeked event for currentTime = 0 if the first frame is at 0 sec.)
  video[_currentTime] = video[_duration] / 2
  await new Promise(resolve => { seekResolve = resolve })

  // Set options to default values if not set
  fallbackToDefault(_format, 'image/png')
  fallbackToDefault(_offsets, [])
  fallbackToDefault(_startTime, 0)
  fallbackToDefault(_endTime, video[_duration])
  fallbackToDefault(_count, 1)
  fallbackToDefault(_onLoad, false)
  fallbackToDefault(_onProgress, false)

  // Filter out invalid offsets
  if (!isPrototypeOf(Array, options[_offsets])) { options[_offsets] = [] } else {
    options[_offsets] = options[_offsets].filter(offset => {
      return isTimestamp(offset)
    })
  }

  if (options[_offsets][_length] !== 0) { extractOffsets = true }

  // Check if start and end times are valid
  if (!isTimestamp(options[_startTime])) { options[_startTime] = 0 }

  if (!isTimestamp(options[_endTime])) { options[_endTime] = video[_duration] }

  // Float values
  options[_startTime] = +options[_startTime]
  options[_endTime] = +options[_endTime]

  if (options[_startTime] >= options[_endTime]) {
    options[_startTime] = options[_endTime]
    options[_count] = 1
  }

  // Convert count value to a positive integer (floor() or 0 if string)
  options[_count] = Math.abs(~~options[_count])
  if (options[_count] === 0) { options[_count] = 1 }
  if (extractOffsets) { options[_count] = options[_offsets][_length] }

  // Starting at startTime and ending at endTime - interval
  const interval = (options[_endTime] - options[_startTime]) / options[_count]

  // Set Width and Height
  let isWidthSet = hasOwnProperty[_call](options, 'width')
  let isHeightSet = hasOwnProperty[_call](options, 'height')
  const videoDimensionRatio = video.videoWidth / video.videoHeight

  // Reset Width and Height if not valid
  if (isWidthSet && !isNumber(options[_width])) { isWidthSet = false }

  if (isHeightSet && !isNumber(options[_height])) { isHeightSet = false }

  if (!isWidthSet && !isHeightSet) {
    // Both Width and Height not set
    options[_width] = 128 // Default Value (randomly set)
    options[_height] = options[_width] / videoDimensionRatio
  } else if (isWidthSet && !isHeightSet) {
    // Width set but Height not set
    options[_height] = options[_width] / videoDimensionRatio
  } else if (!isWidthSet && isHeightSet) {
    // Height set but Width not set
    options[_width] = options[_height] * videoDimensionRatio
  }

  // Float values
  options[_width] = +options[_width]
  options[_height] = +options[_height]

  // Reset onLoad and onProgress functions if not valid
  if (!isPrototypeOf(Function, options[_onLoad])) { options[_onLoad] = false }

  if (!isPrototypeOf(Function, options[_onProgress])) { options[_onProgress] = false }

  if (options[_onLoad]) { options[_onLoad]() }

  // Buffer Canvas Element
  const canvas = document[_createElement]('canvas')
  const context = canvas.getContext('2d')
  canvas[_width] = options[_width]
  canvas[_height] = options[_height]

  const extract = async resolve => {
    while (index < options[_count]) {
      video[_currentTime] = extractOffsets ? options[_offsets][index] : options[_startTime] + index * interval
      await new Promise(resolve => { seekResolve = resolve })
      context.clearRect(0, 0, canvas[_width], canvas[_height])
      context.drawImage(video, 0, 0, canvas[_width], canvas[_height])
      frames.push({
        offset: video[_currentTime],
        image: canvas.toDataURL(options[_format])
      })
      index++
      if (options[_onProgress]) { options[_onProgress](index, options[_count]) }
    }
    resolve(frames)
  }

  return new Promise(resolve => {
    if (error) { resolve([]) }

    extract(resolve)
  })
}
