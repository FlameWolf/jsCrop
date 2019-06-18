// Enable strict mode to enforce variable declaration
"use strict";
let jsCrop = (function() {
	return Object.freeze({
		"initialise": function(imageElement, options) {
			let cropper = {
				// Minimum/maximum boundaries of the crop grid
				"minLeft": 0,
				"minTop": 0,
				"maxLeft": 0,
				"maxTop": 0,
				"minWidth": 20,
				"minHeight": 20,
				"maxWidth": 0,
				"maxHeight": 0,
				// The crop grid's properties when the mouse down event was triggered
				"originalWidth": 0,
				"originalHeight": 0,
				"originalLeft": 0,
				"originalTop": 0,
				// The X and Y coordinates of the mouse down event
				"originalMouseX": 0,
				"originalMouseY": 0,
				// The X and Y coordinates of the mouse move event
				"pageX": 0,
				"pageY": 0,
				// The amount the cursor has moved since the mouse was pressed
				"deltaX": 0,
				"deltaY": 0,
				// The new left and top coordinates of the crop grid
				"newLeft": 0,
				"newTop": 0,
				// The new width and height of the crop grid
				"newWidth": 0,
				"newHeight": 0,
				// The element that triggered the mouse down event
				"mouseDownElement": null,
				// Page elements
				"imageToCrop": null,
				"imageOverlay": null,
				"gridHolder": null,
				"grid": null,
				"cropResult": null,
				// The resize handles are stored in an object for easier programmatic access
				"resizers": {
					"topLeft": null,
					"topMid": null,
					"topRight": null,
					"rightMid": null,
					"botRight": null,
					"botMid": null,
					"botLeft": null,
					"leftMid": null
				},
				// References to the image overlay canvas context, the crop result canvas context,
				// the crop grid style, and the crop result canvas style
				// are kept outside the event handlers for optimal performance
				"imageOverlayContext": null,
				"cropResultContext": null,
				"gridHolderStyle": null,
				"cropResultStyle": null,
				// The left, top, right, and bottom coordinates of the source image
				"imageLeft": 0,
				"imageTop": 0,
				"imageRight": 0,
				"imageBottom": 0,
				// Crop grid boundaries
				"gridHolderLeft": 0,
				"gridHolderTop": 0,
				"gridHolderWidth": 0,
				"gridHolderHeight": 0,
				// Toggle crop state
				"enableCropMode": function(flag) {
					if(flag) {
						// Show the image overlay
						this.imageOverlay.style.removeProperty("opacity");
						// Show the crop grid
						this.gridHolderStyle.visibility = "visible";
						this.gridHolderStyle.opacity = "1";
						// Highlight the selected area
						this.updateCropBackground();
						// Show the crop result
						this.drawCroppedImage();
					}
					else {
						// Hide the crop grid
						this.gridHolderStyle.removeProperty("opacity");
						// Hide the image overlay
						this.imageOverlay.style.opacity = "0";
					}
				},
				// Set the output canvas
				"setOutputCanvas": function(canvasElement) {
					// Update the output canvas reference
					this.cropResult = canvasElement;
					// Update the output canvas style reference
					this.cropResultStyle = canvasElement.style;
					// Update the output canvas context reference
					this.cropResultContext = canvasElement.getContext("2d");
					// Draw the crop result on to the output canvas
					this.drawCroppedImage();
				},
				// Generate the crop result
				"drawCroppedImage": function() {
					this.gridHolderLeft = this.gridHolder.offsetLeft;
					this.gridHolderTop = this.gridHolder.offsetTop;
					this.gridHolderWidth = this.gridHolder.offsetWidth;
					this.gridHolderHeight = this.gridHolder.offsetHeight;
					// Set the width and height of the output canvas to the width and height of the
					// selected area and adjust the left, top, and bottom margins so that the position
					// of the output image will match the position of the crop grid relative to the source image
					this.cropResult.width = this.gridHolderWidth;
					this.cropResultStyle.marginLeft = this.gridHolderLeft + "px";
					this.cropResult.height = this.gridHolderHeight;
					this.cropResultStyle.marginTop = this.gridHolderTop + "px";
					this.cropResultStyle.marginBottom = (this.imageToCrop.offsetHeight - (this.gridHolderHeight + this.gridHolderTop)) + "px";
					// Clear the output canvas
					this.cropResultContext.clearRect(0, 0, this.gridHolderWidth, this.gridHolderHeight);
					// Draw the cropped image
					this.cropResultContext.drawImage(this.imageToCrop,
						// Source X and Y coordinates are the crop grid's top and left respectively
						this.gridHolderLeft, this.gridHolderTop,
						// Source width and height are the crop grid's width and height respectively
						this.gridHolderWidth, this.gridHolderHeight,
						// The target X and Y coordinates are (0, 0) so that the output image will be
						// drawn at the top left corner of the output canvas; the target width and height
						// are the same as the source width and height respectively
						0, 0, this.gridHolderWidth, this.gridHolderHeight);
				},
				// Download the crop result
				"downloadCroppedImage": function() {
					// Add comments
					let anchorElement = document.createElement("a");
					let anchorElementStyle = anchorElement.style;
					this.drawCroppedImage();
					anchorElement.href = this.cropResult.toDataURL("image/png").replace("image/png", "image/octet-stream");
					anchorElement.download = `${this.imageToCrop.src.match(/^.*[\\\/](.+?)(\.[^.]*$|$)/)[0]}-cropped.png`;
					anchorElementStyle.display = "none";
					anchorElementStyle.visibility = "hidden";
					anchorElementStyle.opacity = 0;
					document.body.appendChild(anchorElement);
					anchorElement.click();
					setTimeout(function() {
						document.body.removeChild(anchorElement);
						anchorElementStyle = null;
						anchorElement = null;
					});
				},
				// Adjust the boundaries of the crop grid
				// so that it may not spill outside the source image
				"fixGrid": function() {
					this.gridHolderLeft = this.gridHolder.offsetLeft;
					this.gridHolderTop = this.gridHolder.offsetTop;
					this.gridHolderWidth = this.gridHolder.offsetWidth;
					this.gridHolderHeight = this.gridHolder.offsetHeight;
					this.maxWidth = (this.imageToCrop.offsetWidth - this.gridHolderLeft);
					this.maxHeight = (this.imageToCrop.offsetHeight - this.gridHolderTop);
					if(this.mouseDownElement !== this.grid) {
						if(this.gridHolderWidth > this.maxWidth)
							this.gridHolderStyle.width = this.maxWidth + "px";
						if(this.gridHolderHeight > this.maxHeight)
							this.gridHolderStyle.height = this.maxHeight + "px";
						if(this.gridHolderWidth < this.minWidth)
							this.gridHolderStyle.width = this.minWidth + "px";
						if(this.gridHolderHeight < this.minHeight)
							this.gridHolderStyle.height = this.minHeight + "px";
					}
					else {
						if(this.gridHolderWidth > this.maxWidth)
							this.gridHolderStyle.left = (this.gridHolder.offsetLeft - (this.gridHolderWidth - this.maxWidth)) + "px";
						if(this.gridHolderHeight > this.maxHeight)
							this.gridHolderStyle.top = (this.gridHolder.offsetTop - (this.gridHolderHeight - this.maxHeight)) + "px";
					}
				},
				// Update the image overlay canvas to highlight the selected area of the source image
				"updateCropBackground": function() {
					// Fill the image overlay canvas with the default fill colour (#000000)
					this.imageOverlayContext.fillRect(0, 0, this.imageOverlay.width, this.imageOverlay.height);
					// Make the area bound by the crop grid transparent
					this.imageOverlayContext.clearRect(this.gridHolder.offsetLeft, this.gridHolder.offsetTop, this.gridHolder.offsetWidth, this.gridHolder.offsetHeight);
				},
				// Add comments
				"setCropRegion": function(left, top, width, height) {
					if(left < this.minLeft)
						left = this.minLeft;
					if(top < this.minTop)
						top = this.minTop;
					this.gridHolderStyle.left = `${left}px`;
					this.gridHolderStyle.top = `${top}px`;
					this.gridHolderStyle.width = `${width}px`;
					this.gridHolderStyle.height = `${height}px`;
					// Prevent the crop grid from spilling
					this.fixGrid();
					// Update the highlighted area
					this.updateCropBackground();
					// Update the crop result
					this.drawCroppedImage();
				},
				// Resize the crop grid when dragging any of the resize handles
				"resizeGrid": function(event) {
					// Prevent the default action
					event.preventDefault();
					// Get the cursor coordinates
					this.pageX = event.pageX;
					this.pageY = event.pageY;
					// Calculate the amount the cursor has moved since the mouse was pressed
					this.deltaX = (this.pageX - this.originalMouseX);
					this.deltaY = (this.pageY - this.originalMouseY);
					// Calculate the new left and top positions of the crop grid
					this.newLeft = (this.originalLeft + this.deltaX);
					this.newTop = (this.originalTop + this.deltaY);
					// The left and top positions should not go outside the source image boundaries
					if(this.newLeft < this.minLeft) {
						this.newLeft = this.minLeft;
						if(this.mouseDownElement === this.resizers.botLeft || this.mouseDownElement === this.resizers.leftMid || this.mouseDownElement === this.resizers.topLeft)
							this.deltaX = (this.newLeft - this.originalLeft);
					}
					else if(this.newLeft > this.maxLeft)
						this.newLeft = this.maxLeft;
					if(this.newTop < this.minTop) {
						this.newTop = this.minTop;
						if(this.mouseDownElement === this.resizers.topLeft || this.mouseDownElement === this.resizers.topMid || this.mouseDownElement === this.resizers.topRight)
							this.deltaY = (this.newTop - this.originalTop);
					}
					else if(this.newTop > this.maxTop)
						this.newTop = this.maxTop;
					// Initialise the new width and height of the crop grid
					// as the same as the old width and height
					this.newWidth = this.originalWidth;
					this.newHeight = this.originalHeight;
					// Resize the crop grid based on which resize boundary is being dragged
					switch(this.mouseDownElement) {
						// Top left
						case this.resizers.topLeft:
							// Change the top and left positions according to the mouse position
							// and update the width and height so that the right and bottom edges will stay the same
							this.newWidth -= this.deltaX;
							this.newHeight -= this.deltaY;
							if(this.newWidth > this.minWidth) {
								this.gridHolderStyle.left = this.newLeft + "px";
								this.gridHolderStyle.width = this.newWidth + "px";
							}
							if(this.newHeight > this.minHeight) {
								this.gridHolderStyle.top = this.newTop + "px";
								this.gridHolderStyle.height = this.newHeight + "px";
							}
							break;
						// Top middle
						case this.resizers.topMid:
							// Change the top position according to the mouse position
							// and update the height so that the bottom edge will stay the same
							this.newHeight -= this.deltaY;
							if(this.newHeight > this.minHeight) {
								this.gridHolderStyle.top = this.newTop + "px";
								this.gridHolderStyle.height = this.newHeight + "px";
							}
							break;
						// Top right
						case this.resizers.topRight:
							// Change the width and top position according to the mouse position
							// and update the height so that the bottom edge will stay the same
							this.newWidth += this.deltaX;
							this.newHeight -= this.deltaY;
							if(this.newWidth > this.minWidth)
								this.gridHolderStyle.width = this.newWidth + "px";
							if(this.newHeight > this.minHeight) {
								this.gridHolderStyle.top = this.newTop + "px";
								this.gridHolderStyle.height = this.newHeight + "px";
							}
							break;
						// Right middle
						case this.resizers.rightMid:
							// Change the width according to the mouse position
							this.newWidth += this.deltaX;
							if(this.newWidth > this.minWidth)
								this.gridHolderStyle.width = this.newWidth + "px";
							break;
						// Bottom right
						case this.resizers.botRight:
							// Change the width and height according to the mouse position
							this.newWidth += this.deltaX;
							this.newHeight += this.deltaY;
							if(this.newWidth > this.minWidth)
								this.gridHolderStyle.width = this.newWidth + "px";
							if(this.newHeight > this.minHeight)
								this.gridHolderStyle.height = this.newHeight + "px";
							break;
						// Bottom middle
						case this.resizers.botMid:
							// Change the height according to the mouse position
							this.newHeight += this.deltaY;
							if(this.newHeight > this.minHeight)
								this.gridHolderStyle.height = this.newHeight + "px";
							break;
						// Bottom left
						case this.resizers.botLeft:
							// Change the height and left position according to the mouse position
							// and update the width so that the right edge will stay the same
							this.newWidth -= this.deltaX;
							this.newHeight += this.deltaY;
							if(this.newWidth > this.minWidth) {
								this.gridHolderStyle.left = this.newLeft + "px";
								this.gridHolderStyle.width = this.newWidth + "px";
							}
							if(this.newHeight > this.minHeight)
								this.gridHolderStyle.height = this.newHeight + "px";
							break;
						// Left middle
						case this.resizers.leftMid:
							// Change the left position according to the mouse position
							// and update the width so that the right edge will stay the same
							this.newWidth -= this.deltaX;
							if(this.newWidth > this.minWidth) {
								this.gridHolderStyle.left = this.newLeft + "px";
								this.gridHolderStyle.width = this.newWidth + "px";
							}
							break;
						// Crop grid
						case this.grid:
							// Change the left and top positions according to the mouse position
							if((this.newLeft < this.gridHolder.offsetLeft) || (this.gridHolder.offsetWidth < this.maxWidth))
								this.gridHolderStyle.left = this.newLeft + "px";
							if((this.newTop < this.gridHolder.offsetTop) || (this.gridHolder.offsetHeight < this.maxHeight))
								this.gridHolderStyle.top = this.newTop + "px";
							// If the crop grid hits the left/top/right/bottom boundaries, update
							// the original mouse position and the original left position, so that
							// when the user moves the cursor back, the crop grid won't remain locked
							// until the cursor reaches the position where the mouse was pressed
							if((this.pageX >= this.imageLeft) && (this.pageX <= this.imageRight)) {
								if((this.gridHolder.offsetLeft === this.minLeft) || (this.gridHolder.offsetWidth === this.maxWidth)) {
									this.originalMouseX += this.deltaX;
									this.originalLeft = this.gridHolder.offsetLeft;
								}
							}
							if((this.pageY >= this.imageTop) && (this.pageY <= this.imageBottom)) {
								if((this.gridHolder.offsetTop === this.minTop) || (this.gridHolder.offsetHeight === this.maxHeight)) {
									this.originalMouseY += this.deltaY;
									this.originalTop = this.gridHolder.offsetTop;
								}
							}
							break;
						default:
							break;
					}
					// Prevent the crop grid from spilling
					this.fixGrid();
					// Update the highlighted area
					this.updateCropBackground();
					// Update the crop result
					this.drawCroppedImage();
				},
				// Fires when the mouse is released
				"endResizingGrid": function(event) {
					// Prevent the default action
					event.preventDefault();
					// Stop listening to the mouse move and mouse up event handlers
					// because they are no longer needed once the mouse is released
					document.removeEventListener("mousemove", this.resizeGrid.bind(this));
					document.removeEventListener("mouseup", this.endResizingGrid.bind(this));
					// No mouse down trigger
					this.mouseDownElement = null;
				},
				// Fires when the mouse is pressed
				"startResizingGrid": function(event) {
					// Prevent the default action
					event.preventDefault();
					// The crop grid's initial properties
					this.originalWidth = this.gridHolder.offsetWidth;
					this.originalHeight = this.gridHolder.offsetHeight;
					this.originalLeft = this.gridHolder.offsetLeft;
					this.originalTop = this.gridHolder.offsetTop;
					// The X and Y coordinates of the cursor relative to the page
					this.originalMouseX = event.pageX;
					this.originalMouseY = event.pageY;
					// The element that triggered the mouse down event
					this.mouseDownElement = event.currentTarget;
					// Start listening to the mouse move and mouse up events
					// when the mouse is pressed on a resizer element
					document.addEventListener("mousemove", this.resizeGrid.bind(this));
					document.addEventListener("mouseup", this.endResizingGrid.bind(this));
				},
				// Hide the crop grid when it is made transparent so that it may no longer respond to events
				"hideGrid": function() {
					if(!this.gridHolderStyle.opacity)
						this.gridHolderStyle.removeProperty("visibility");
				},
				"destroy": function() {
					let imageHolder = this.imageToCrop.parentElement;
					imageHolder.parentElement.insertBefore(this.imageToCrop, imageHolder);
					this.gridHolder.removeEventListener("transitionend", this.hideGrid.bind(this));
					this.grid.removeEventListener("mousedown", this.startResizingGrid.bind(this));
					Object.entries(this.resizers).forEach(function([key, value]) {
						value.removeEventListener("mousedown", this.startResizingGrid.bind(this));
					}.bind(this));
					// Remove the style and context references
					this.cropResultStyle = null;
					this.gridHolderStyle = null;
					this.cropResultContext = null;
					this.imageOverlayContext = null;
					// Remove the newly created page elements
					Object.entries(this.resizers).forEach(function([key, value]) {
						value.remove();
					}.bind(this));
					this.grid.remove();
					this.gridHolder.remove();
					this.imageOverlay.remove();
					imageHolder.remove();
					// Remove the page element references
					this.resizers = null;
					this.cropResult = null;
					this.grid = null;
					this.gridHolder = null;
					this.imageOverlay = null;
					this.imageToCrop = null;
					imageHolder = null;
				},
				// Initialise the crop grid and the output canvas
				"initialiseGrid": function() {
					// The bounding rectangle of the source image
					let imageToCropClientBoundingRect = this.imageToCrop.getBoundingClientRect();
					// The width and height of the source image
					let imageWidth = this.imageToCrop.offsetWidth;
					let imageHeight = this.imageToCrop.offsetHeight;
					// Get the bounding coordinates of the source image
					this.imageLeft = imageToCropClientBoundingRect.left;
					this.imageTop = imageToCropClientBoundingRect.top;
					this.imageRight = imageToCropClientBoundingRect.right;
					this.imageBottom = imageToCropClientBoundingRect.bottom;
					// Set the width and height of the crop grid to the same as those of the source image
					this.imageOverlay.width = imageWidth;
					this.imageOverlay.height = imageHeight;
					// Initialise the image overlay canvas context and the crop grid style references
					this.imageOverlayContext = this.imageOverlay.getContext("2d");
					this.gridHolderStyle = this.gridHolder.style;
					// Set then initial size of the crop grid as 20 pixels smaller than the source image
					this.gridHolderStyle.top = "20px";
					this.gridHolderStyle.left = "20px";
					this.gridHolderStyle.width = (imageWidth - 40) + "px";
					this.gridHolderStyle.height = (imageHeight - 40) + "px";
					// Set the maximum width and maximum height of the crop grid to the same as those of the source image
					this.maxWidth = imageWidth;
					this.maxHeight = imageHeight;
					// Set the maximum top and left boundaries of the crop grid
					this.maxLeft = (this.maxWidth - this.minWidth);
					this.maxTop = (this.maxHeight - this.minHeight);
					// Initialise the output canvas
					this.setOutputCanvas(document.createElement("canvas"));
					// Attach event handlers
					Object.entries(this.resizers).forEach(function([key, value]) {
						value.addEventListener("mousedown", this.startResizingGrid.bind(this));
					}.bind(this));
					this.grid.addEventListener("mousedown", this.startResizingGrid.bind(this));
					this.gridHolder.addEventListener("transitionend", this.hideGrid.bind(this));
					// Detach event handlers on page unload
					window.addEventListener("unload", this.destroy.bind(this));
					// Remove the bounding rectangle reference
					imageToCropClientBoundingRect = null;
				}
			};
			let imageHolder = document.createElement("div");
			let resizerClassNames = ["top-left", "top-mid", "top-right", "right-mid", "bot-right", "bot-mid", "bot-left", "left-mid"];
			let gridTableBody = document.createElement("tbody");
			let addResizer = function(value, index, source) {
				let resizer = document.createElement("div");
				let resizerHandle = document.createElement("div");
				let resizerClassName = `js-crop-resizer ${value}`;
				resizer.className = resizerClassName;
				resizerHandle.className = `${resizerClassName} handle`;
				cropper.resizers[value.split("-").reduce((x, y) => x += (y[0].toUpperCase() + y.substring(1)))] = resizer;
				cropper.gridHolder.appendChild(resizerHandle);
				cropper.gridHolder.appendChild(resizer);
				resizerHandle = null;
				resizer = null;
			};
			cropper.imageToCrop = imageElement;
			cropper.imageOverlay = document.createElement("canvas");
			cropper.gridHolder = document.createElement("div");
			cropper.grid = document.createElement("table");
			cropper.gridHolder.classList.add("js-crop-grid-holder");
			cropper.grid.classList.add("js-crop-grid");
			imageHolder.classList.add("js-crop-image-holder");
			resizerClassNames.forEach(addResizer.bind(this));
			for(let rowLoopIndex = 0; rowLoopIndex <= 2; rowLoopIndex++) {
				let tableRow = document.createElement("tr");
				for(let columnLoopIndex = 0; columnLoopIndex <= 2; columnLoopIndex++)
					tableRow.appendChild(document.createElement("td"));
				gridTableBody.appendChild(tableRow);
				tableRow = null;
			}
			cropper.grid.appendChild(gridTableBody);
			cropper.gridHolder.appendChild(cropper.grid);
			imageElement.parentElement.insertBefore(imageHolder, imageElement);
			imageHolder.appendChild(imageElement);
			imageHolder.appendChild(cropper.imageOverlay);
			imageHolder.appendChild(cropper.gridHolder);
			cropper.initialiseGrid();
			if(!options)
				options = {};
			cropper.setOutputCanvas(options.outputCanvas || cropper.cropResult);
			cropper.enableCropMode(!(options.startInCropMode === false));
			gridTableBody = null;
			resizerClassNames = null;
			imageHolder = null;
			return Object.freeze({
				"enableCropMode": cropper.enableCropMode.bind(cropper),
				"setOutputCanvas": cropper.setOutputCanvas.bind(cropper),
				"drawCroppedImage": cropper.drawCroppedImage.bind(cropper),
				"downloadCroppedImage": cropper.downloadCroppedImage.bind(cropper),
				"setCropRegion": cropper.setCropRegion.bind(cropper),
				"destroy": cropper.destroy.bind(cropper)
			});
		}
	});
})();