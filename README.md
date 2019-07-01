# jsCrop
A simple, plain JavaScript library to crop images.
## Usage
Include the files `js-crop-min.css` and `js-crop-min.js` in your page. Invoke `jsCrop` as:
```
let cropper = jsCrop.initialise(<<image-element>>, options);
```
For example, if your page has an `<img>` element with its `id` as `imageToCrop`, this is how you would pass it to the `jsCrop` constructor:
```
let cropper = jsCrop.initialise(document.getElementById("imageToCrop"));
```
> :warning: _Warning:_ If you try to pass an image to the `initialise` function before it is loaded, `jsCrop` may not work properly. To avoid this, put the call to the `initialise` function inside the `load` event handler for the image, like this:
> ```
> document.getElementById("imageToCrop").addEventListener("load", function() {
> 	jsCrop.initialise(this));
> });
> ```
## Static Methods
- `initialise (`_`imageElement, options`_`)`: Initialises a new `jsCrop` instance using the specified image element. The `options` parameter is an object that defaults to `{}` if not specified. It can have the below properties:
  - `outputCanvas`: A `<canvas>` element on the page on to which `jsCrop` should draw the output image.
  - `startInCropMode`: Whether or not to display the crop grid initially. Default is `true`.

  &#xA0;
  > :warning: _Warning:_ Calling `jsCrop.initialise` on an image that already has a `jsCrop` instance associated with it will destroy the `jsCrop` instance that is currently associated with it. This is by design. If you want to get the `jsCrop` instance that is currently associated with an image, use `jsCrop.getCurrentInstance`.
- `getCurrentInstance (`_`imageElement`_`)`: Returns the `jsCrop` instance that is currently associated with the specified image.
## Instance Methods
- `enableCropMode (`_`flag`_`)`: Turns crop mode on/off.
- `setOutputCanvas (`_`canvasElement`_`)`: Specify a `<canvas>` element on the page on to which jsCrop should draw the output image.
- `drawCroppedImage`: Draw the crop result to the output canvas.
- `downloadCroppedImage`: Download the crop result.
- `setCropRegion (`_`left, top, width, height`_`)`: Set the position and size of the crop region.
- `destroy`: Destroy the `jsCrop` object and release the resources.
## Demo
Visit [https://flamewolf.github.io/jsCrop.html](https://flamewolf.github.io/jsCrop.html).
## Known Issues
- If the image has a `z-index` value of anything other than `"auto"`, then `jsCrop` might not work properly. This can be fixed by putting the image inside a `<div>` and moving the `z-index` value from the image to the container `<div>`.