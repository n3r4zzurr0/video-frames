[circleci-image]: https://circleci.com/gh/n3r4zzurr0/video-frames.svg?style=shield
[circleci-url]: https://circleci.com/gh/n3r4zzurr0/video-frames
[npm-image]: https://img.shields.io/npm/v/video-frames.svg
[npm-url]: https://npmjs.org/package/video-frames
[size-image]: https://img.shields.io/bundlephobia/minzip/video-frames@latest
[size-url]: https://bundlephobia.com/result?p=video-frames@latest
[vulnerabilities-image]: https://snyk.io/test/npm/video-frames/badge.svg
[vulnerabilities-url]: https://snyk.io/test/npm/video-frames
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com
[license-image]: https://img.shields.io/github/license/n3r4zzurr0/video-frames.svg
[license-url]: https://github.com/n3r4zzurr0/video-frames/blob/main/LICENSE

# video-frames
[![circleci][circleci-image]][circleci-url] [![npm][npm-image]][npm-url] [![size][size-image]][size-url] [![known vulnerabilities][vulnerabilities-image]][vulnerabilities-url] [![javascript style guide][standard-image]][standard-url] [![license][license-image]][license-url]

Client-side video frames extraction as base64 encoded images.

**[Demo](https://n3r4zzurr0.in/video-frames/) / [CodePen](https://codepen.io/n3r4zzurr0/pen/abqOXpQ?editors=1010)**

<hr>

:warning: Doesn't work in Safari on iOS

From [Apple Developer Documentation](https://developer.apple.com/documentation/webkitjs/canvasrenderingcontext2d/1630282-drawimage),

> The image object can be an `img` element, a `canvas` element, or a `video` element. **Use of the `video` element is not supported in Safari on iOS**, however.

<hr><br>

## Installation

**npm**

```
npm install video-frames
```

**CDN**

```html
<script src="https://cdn.jsdelivr.net/npm/video-frames@1/dist/videoframes.umd.min.js"></script>
```

or

```html
<script src="https://unpkg.com/video-frames@1"></script>
```

## Usage
```js
const videoFrames = require('video-frames');

videoFrames({
	// Big Buck Bunny (1080p 60fps)
	url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4',
	// Extract 10 evenly spaced (time-wise) frames
	count: 10
}).then((frames) => {
	// frames is an array of objects
	// [
	//   {
	//     offset: (timestamp in seconds)
	//     image: (base64 encoded image)
	//   },
	//   ...
	// ]
});
```

## API

### `videoFrames(options)`

Returns a `Promise` for when all frames have been extracted. There are a few properties that can be set in `options`.

#### `options`

*	####  `url` (required)

	Default value: *empty*

	The URL (self, remote [an [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) header must be present in case of a remote URL], or blob) of the source video from which the frames are to be extracted. Since the [`video`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) element is used in the extraction process, the allowed formats are the ones that are playable in it. You can search for the supported formats on [caniuse.com/?search=video%20format](https://caniuse.com/?search=video%20format)

*	####  `width`

	Default value: `128`

	Width of the extracted frames in pixels.
If no value for `width` is set, but a value for `height` is set, then the `width` will be calculated using the video dimensions.

*	####  `height`

	Default value: `auto`

	Height of the extracted frames in pixels.
If not set, `height` is calculated automatically from the value of `width` using the video dimensions.

*	####  `format`

	Default value: `image/png`

	MIME type of the extracted frames.
Since the [`canvas`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element is used for drawing the frames and `toDataURL(format)` is used for reading them as base64 encoded images, the allowed MIME types are the ones that are supported by `toDataURL`.

	From [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL#parameters), 

	> **`toDataURL(type)`**
	> 
	> ...
	> 
	> **`type`**
	> 
	> A string indicating the image format. The default type is `image/png`; this image format will be also used if the specified type is not supported.

	So, if a type is not supported, it will fall back to `image/png`.

*	####  `startTime`

	Default value: `0`

	Start timestamp (in seconds) of the range from where the frames are to be extracted.
It will be ignored if a valid value for `offsets` is set.

*	####  `endTime`

	Default value: *Video Duration*

	End timestamp (in seconds) of the range from where the frames are to be extracted.
It will be ignored if a valid value for `offsets` is set.

*	####  `count`

	Default value: `1`

	Number of frames to be extracted from the range set by `startTime` and `endTime`.
The frames are extracted from evenly spaced timestamps across the range.
It will be ignored if a valid value for `offsets` is set.

*	####  `offsets`

	Default value: `[]`

	Array of timestamps (in seconds) to extract frames at.
If a valid value for `offsets` is set, `startTime`, `endTime`, and `count` are **ignored**.

*	####  `onLoad`

	Default value: `false`

	Function to be called when the source video has loaded and the extraction process has started.

	```js
	onLoad: () => { console.log('video loaded') }
	```

*	####  `onProgress`

	Default value: `false`

	Function to be called on every successful frame extraction.
	```js
	onProgress: (framesExtracted) => { console.log(`${framesExtracted} frames extracted`) }
	```
	```js
	onProgress: (framesExtracted, totalFrames) => { console.log(`${framesExtracted} of ${totalFrames} frames extracted`) }
	```


## License

MIT © [Utkarsh Verma](https://github.com/n3r4zzurr0)
