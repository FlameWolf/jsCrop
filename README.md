# jsCrop
A simple, plain JavaScript library to crop images.
## Use
Include the files `js-crop.css` and `js-crop.js` in your page. Invoke `jsCrop` as:
```
let cropper = jsCrop.initialise(<<image-element>>, options);
```
For example, if your page has an `<img>` element with its `id` as `imageToCrop`, this is how you would pass it to the `jsCrop` constructor:
```
let cropper = jsCrop.initialise(document.getElementById("imageToCrop"));
```
The `options` parameter will be an object. These properties are currently supported:

`outputCanvas`: A `<canvas>` element on the page on to which `jsCrop` should draw the output image.
`startInCropMode`: Whether or not to display the crop grid initially. Default is `true`.
## Methods
`enableCropMode(`_`flag`_`)`: Turns crop mode on/off.

`setOutputCanvas(`_`canvasElement_`)`: Specify a `<canvas>` element on the page on to which jsCrop should draw the output image.
  
`drawCroppedImage`: Draw the crop result to the output canvas.

`downloadCroppedImage`: Download the crop result.

`setCropRegion(`_`left, top, width, height`_`)`: Set the position and size of the crop region.

`destroy`: Destroy the `jsCrop` object and release the resources.
