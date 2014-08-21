c = new fabric.CanvasWithViewport("zoomable_canvas",
  isDrawingMode: true
)
c.isDrawingMode = false

d = $("#zoomable_canvas")
ctx = d[0].getContext("2d")
draw = ->
  ctx.fillStyle = "#000"

$(".buttons .edit").click ->
  $(this).addClass "active"
  $(".buttons a").not(this).removeClass "active"
  c.isDrawingMode = false
  c.isGrabMode = false
  false

$(".buttons .pencil").click ->
  $(this).addClass "active"
  $(".buttons a").not(this).removeClass "active"
  c.isDrawingMode = true
  c.isGrabMode = false
  false

$(".buttons .grab").click ->
  $(this).addClass "active"
  $(".buttons a").not(this).removeClass "active"
  c.isDrawingMode = false
  c.isGrabMode = true
  false

$(".buttons .zoom-in").click ->
  c.setZoom c.viewport.zoom * 1.1
  false

$(".buttons .zoom-out").click ->
  c.setZoom c.viewport.zoom / 1.1
  false

$(".buttons .eraser").click ->
  c.clear()
  false



# ------------------------------



# ------------------------------
$(".buttons .apply").click ->
    width = parseInt($("#width-obj").val())
    height = parseInt($("#height-obj").val())

    rect.setHeight(height)
    rect.setWidth(width)
    c.renderAll()
   

$("#height-obj").on "input", (e) ->
    width = parseInt($("#width-obj").val())
    height = parseInt($("#height-obj").val())

    rect.setHeight(height)
    rect.setWidth(width)
    c.renderAll()
    

$("#width-obj").on "input", (e) ->
    width = parseInt($("#width-obj").val())
    height = parseInt($("#height-obj").val())

    rect.setHeight(height)
    rect.setWidth(width)
    c.renderAll()

# ------------------------------

$("#menu-close").click (e) ->
  e.preventDefault()
  $("#sidebar-wrapper").toggleClass "active"

$("#menu-toggle").click (e) ->
  e.preventDefault()
  $("#sidebar-wrapper").toggleClass "active"

c.on 'after:render', () ->
  @calcOffset()

