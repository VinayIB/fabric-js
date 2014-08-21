
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.4.0/fabric.min.js"></script>
    <script type="text/javascript" src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.11/jquery.mousewheel.min.js"></script>
    <style type="text/css">
        .canvas
        {
            border-style: solid;
            border-width: 1px;
        }
        .hidden
        {
            display: none;
        }
    </style>
</head>
<body>
    <div id="nocanvas" class="hidden">
        <p>
            Canvas is not supported by your browser.</p>
        <p>
            Go to <a href="http://caniuse.com/canvas">http://caniuse.com/canvas</a> to see which
            browsers support Canvas.</p>
    </div>
    <button type="button" class="add">ADD CIRCLE</button>
    <canvas id="myCanvas" class="canvas"></canvas>
    <script type="text/javascript">
        function isCanvasSupported() {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        }

        if (!isCanvasSupported()) {
            document.getElementById('nocanvas').className = '';
            document.getElementById('myCanvas').className = 'hidden';
        }
        else {
            // Constants
            var canvasHeight = 580;
            var canvasWidth = 865;
            var borderColor = '9DD290';
            var cornerColor = '1A7206';
            var cornerSize = 6;
            var zoomScale = 1.0;

            var mouseDownOutsideObject = false;
            var mouseXStart = [], mouseYStart = [];
            var mouseXOrig = 0, mouseYOrig = 0;

            // Canvas
            var canvas = new fabric.Canvas('myCanvas');
            canvas.setHeight(canvasHeight);
            canvas.setWidth(canvasWidth);

            function getBackground() {
                var objects = canvas.getObjects();
                for (var i = 0; i < objects.length; i++) {
                    if (objects[i].isBackground == true) {
                        return objects[i];
                    }
                }
                return undefined;
            }

            window.onload = function () {
                // Register object modified event handler
                canvas.on('object:modified', function (e) {
                    var obj = e.target;
                    var rect = obj.getBoundingRect();

                    var background = getBackground();

                    if (rect.left < background.left
                        || rect.top < background.top
                        || rect.left + rect.width > background.left + (background.width * background.scaleX)
                        || rect.top + rect.height > background.top + (background.height * background.scaleY)) {
                        if (obj.getAngle() != obj.originalState.angle) {
                            obj.setAngle(obj.originalState.angle);
                        }
                        else {
                            obj.setTop(obj.originalState.top);
                            obj.setLeft(obj.originalState.left);
                            obj.setScaleX(obj.originalState.scaleX);
                            obj.setScaleY(obj.originalState.scaleY);
                        }
                        obj.setCoords();
                    }

                    if (obj.zoomScale != undefined) {
                        obj.zoomScale = obj.scaleX;
                    }

                });

                // Mouse wheel event handler
                $("body").mousewheel(function (event, delta) {
                    var mousePageX = event.pageX;
                    var mousePageY = event.pageY;

                    var offset = $("#myCanvas").offset();
                    var canvasX = offset.left;
                    var canvasY = offset.top;

                    // Ignore if mouse is not on canvas
                    if (mousePageX < canvasX || mousePageY < canvasY || mousePageX > (canvasX + canvas.width)
                                || mousePageY > (canvasY + canvas.height)) {
                        return;
                    }

                    // Ignore if mouse is not on background
                    var background = getBackground();

                    var mouseOffsetX = event.offsetX;
                    var mouseOffsetY = event.offsetY;

                    if (mouseOffsetX < background.left || mouseOffsetX > background.left + background.currentWidth
                                || mouseOffsetY < background.top || mouseOffsetY > background.top + background.currentHeight) {
                        return;
                    }

                    var scaleFactor = 1.1;
                    var change = (delta > 0) ? scaleFactor : (1 / scaleFactor);

                    // Limit zooming out
                    var newZoomScale = zoomScale * change;
                    if (newZoomScale < 1.1) {
                        return;
                    }
                    zoomScale = newZoomScale;

                    var backgroundWidthOrig = (background.width * background.scaleX);
                    var backgroundHeightOrig = (background.height * background.scaleY);

                    // Scale objects
                    var objects = canvas.getObjects();
                    for (var i in objects) {
                        var obj = objects[i];

                        if (obj.zoomScale != undefined) {
                            obj.scaleX = obj.zoomScale * zoomScale;
                            obj.scaleY = obj.zoomScale * zoomScale;
                        }

                        obj.left = obj.left * change;
                        obj.top = obj.top * change;
                        obj.setCoords();
                    }

                    var backgroundWidthNew = (background.width * background.scaleX);
                    var backgroundHeightNew = (background.height * background.scaleY);

                    var backgroundWidthDelta = backgroundWidthNew - backgroundWidthOrig;
                    var backgroundHeightDelta = backgroundHeightNew - backgroundHeightOrig;

                    // Shift objects
                    for (var i in objects) {
                        var obj = objects[i];
                        obj.left -= (backgroundWidthDelta / 2);
                        obj.top -= (backgroundHeightDelta / 2);
                        obj.setCoords();
                    }

                    canvas.renderAll();

                    event.stopPropagation();
                    event.preventDefault();
                });

                // Register mouse down event handler
                $('canvas').mousedown(function (e) {
                    if (e.offsetX == undefined) {
                        e.offsetX = e.pageX-$('canvas').offset().left;
                        e.offsetY = e.pageY-$('canvas').offset().top;
                    }
                    
                    mouseXOrig = e.offsetX;
                    mouseYOrig = e.offsetY;

                    // Ignore if mouse is not on background
                    var background = getBackground();
                    if (mouseXOrig < background.left
                        || mouseXOrig > background.left + (background.width * zoomScale)
                        || mouseYOrig < background.top
                        || mouseYOrig > background.top + (background.height * zoomScale)) {
                        return;
                    }

                    var activeObject = canvas.getActiveObject();
                    if (activeObject != undefined) {
                        canvas.bringToFront(activeObject);
                        return;
                    }

                    mouseDownOutsideObject = true;

                    var objects = canvas.getObjects();

                    for (var i = 0; i < objects.length; i++) {
                        mouseXStart[i] = objects[i].left;
                        mouseYStart[i] = objects[i].top;
                    }
                    canvas.renderAll();

                });

                // Register mouse up event handler
                canvas.on('mouse:up', function (e) {
                    mouseDownOutsideObject = false;
                    getBackground().selectable = false;
                });

                // Register mouse move event handler
                $('canvas').mousemove(function (e) {
                    if (mouseDownOutsideObject) {
                        var background = getBackground();
                        background.selectable = true;

                        var mouseXNew = e.pageX - $(this).offset().left;
                        var mouseYNew = e.pageY - $(this).offset().top;

                        var mouseXDelta = (mouseXNew - mouseXOrig);
                        var mouseYDelta = (mouseYNew - mouseYOrig);

                        var borderWidth = 200;

                        if (background.getLeft() + mouseXDelta <= borderWidth
                            && background.getTop() + mouseYDelta <= borderWidth
                            && background.getLeft() + background.getWidth() + mouseXDelta >= canvas.getWidth() - borderWidth
                            && background.getTop() + background.getHeight() + mouseYDelta >= canvas.getHeight() - borderWidth) {
                            var objects = canvas.getObjects();

                            for (var i = 0; i < objects.length; i++) {
                                objects[i].setLeft(mouseXDelta + mouseXStart[i]);
                                objects[i].setTop(mouseYDelta + mouseYStart[i]);
                                objects[i].setCoords();
                            }

                            canvas.renderAll();
                        }

                        background.selectable = false;
                    }
                });


                // Add a background
                var background = new fabric.Rect({
                    left: 0,
                    top: 0,
                    fill: "White",
                    stroke: 'White',
                    width: 400,
                    height: 400,
                    scaleX: 1,
                    scaleY: 1,
                    selectable: false,
                    zoomScale: 1,
                    isBackground: true,
                    stroke: "1px"
                });
                canvas.add(background);
                background.center();
                // fabric.util.loadImage('background.png', function (img) {
                //     background.setPatternFill({
                //         source: img,
                //         repeat: 'repeat'
                //     });
                //     canvas.renderAll();
                // });

                // Bring sites to front
                // canvas.bringToFront(site1);
                // canvas.bringToFront(site2);
                canvas.renderAll();

            }

            canvas.on('after:render', function() {
              return this.calcOffset();
            });

            $(".add").click(function(event) {
                 var rects = new fabric.Rect({
                    left: 400,
                    top: 100,
                    fill: "black",
                    stroke: 'White',
                    width: 400,
                    height: 200,
                    scaleX: 0.1,
                    // scaleY: 1,
                    // selectable: false,
                    // zoomScale: 1,
                    // isBackground: true,
                    stroke: "1px"
                });
                 canvas.add(rects);
                 rects.center();
                canvas.bringToFront(rects);
                 canvas.renderAll();

            });
        }

    </script>
</body>
</html>