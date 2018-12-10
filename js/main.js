var gl

function initGL(canvas) {
    try {
        gl = canvas.getContext('webgl')
        gl.viewportWidth = canvas.width
        gl.viewportHeight = canvas.height
    } catch (e) {}
    if (!gl) {
        alert('Tidak bisa menginisialisasi WebGL')
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id)
    if (!shaderScript) {
        return null
    }

    var str = ''
    var k = shaderScript.firstChild
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent
        }

        k = k.nextSibling
    }

    var shader
    if (shaderScript.type == 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER)
    } else if (shaderScript.type = 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER)
    } else {
        return null
    }

    gl.shaderSource(shader, str)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader))

        return null
    }

    return shader
}

var shaderProgram

function initShaders() {
    var fragmentShader = getShader(gl, 'shader-fs')
    var vertexShader = getShader(gl, 'shader-vs')
    shaderProgram = gl.createProgram()

    gl.attachShader(shaderProgram, fragmentShader)
    gl.attachShader(shaderProgram, vertexShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Tidak bisa menginisialisasi shaders')
    }

    gl.useProgram(shaderProgram)
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix')
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
}

var mvMatrix = mat4.create()
var mvMatrixStack = []
var pMatrix = mat4.create()

function mvPushMatrix() {
    var copy = mat4.create()
    mat4.copy(copy, mvMatrix)
    mvMatrixStack.push(copy)
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Tumpukan matriks kosong"
    }

    mvMatrix = mvMatrixStack.pop()
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}

var nVertexPosBuffer
var nVertexColorBuffer
var nVertex = []

function drawLetterN() {
    nVertexPosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, nVertexPosBuffer)

    nVertex = [
        -1.0, -1.0, 0.0,
        -0.5, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        -0.5, 1.0, 0.0,

        0.5, -1.0, 0.0,
        1.0, -1.0, 0.0,
        0.5, 1.0, 0.0,
        1.0, 1.0, 0.0,
    ]

    nVertex = matrixScaling(nVertex, 0.25)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nVertex), gl.STATIC_DRAW)
    nVertexPosBuffer.itemSize = 3
    nVertexPosBuffer.numItems = nVertex.length / 3

    nVertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, nVertexColorBuffer)

    var nWarna = []
    for (var i = 0; i < nVertexPosBuffer.numItems; i++) {
        nWarna = nWarna.concat([i * 0.25 , i * 0.50, i * 0.75, 1])
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nWarna), gl.STATIC_DRAW)
    nVertexColorBuffer.itemSize = 4
    nVertexColorBuffer.numItems = nVertexPosBuffer.numItems
}

var boxVertexPosBuffer
var boxVertexColorBuffer

function drawBoxWireframe() {
    boxVertexPosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexPosBuffer)

    var boxVertices = [
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW)
    boxVertexPosBuffer.itemSize = 3
    boxVertexPosBuffer.numItems = boxVertices.length / 3

    boxVertexColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexColorBuffer)

    var boxVerticesWarna = []
    for (var i = 0; i < boxVertexPosBuffer.numItems; i++) {
        boxVerticesWarna = boxVerticesWarna.concat([i * 0.5, i * 0.75, i * 90, 1])
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVerticesWarna), gl.STATIC_DRAW)
    boxVertexColorBuffer.itemSize = 4
    boxVertexColorBuffer.numItems = boxVertexPosBuffer.numItems
}

var rTri = 0
var rSquare = 0

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    mat4.perspective(pMatrix, glMatrix.toRadian(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
    mat4.identity(mvMatrix)
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -4.0])

    cekBoundary()
    nLetterMovement()
    mvPushMatrix()
    mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(rTri), [0.0, 1.0, 0.0])
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, nVertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, nVertexColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, nVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, nVertexPosBuffer.numItems)
    mvPopMatrix()

    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexPosBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, boxVertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexColorBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, boxVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)
    setMatrixUniforms()
    gl.drawArrays(gl.LINES, 0, boxVertexPosBuffer.numItems)
}

var lastTime = 0

function animate() {
    var timeNow = new Date().getTime()
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime
        rTri += (90 * elapsed) / 1000.0
        rSquare += (75 * elapsed) / 1000.0
    }

    lastTime = timeNow
}

var center = [0, 0, 0]
var pos = [0, 0, 0]
var lrTurn = 1.0
var currentPressedKeys = {}

function handleKeyDown(event) {
    currentPressedKeys[event.keyCode] = true
}

function handleKeyUp(event) {
    currentPressedKeys[event.keyCode] = false
}

function handleKeys() {
    if (currentPressedKeys[37]) {
        // Kiri
        pos[0] -= 0.05
        console.log("kiri");
    }

    if (currentPressedKeys[39]) {
        // Kanan
        pos[0] += 0.05
        console.log("kanan");
    }

    if (currentPressedKeys[38]) {
        // Atas
        pos[1] += 0.05
        console.log("atas");
    }

    if (currentPressedKeys[40]) {
        // Bawah
        pos[1] -= 0.05
        console.log("bawah");
    }
}

function nLetterMovement() {
    gl.bindBuffer(gl.ARRAY_BUFFER, nVertexPosBuffer)
    nVertex = matrixTranslating(nVertex, pos[0] * 0.01, pos[1] * 0.01, pos[2] * 0.01)
    center[0] += (pos[0] * 0.01)
    center[1] += (pos[1] * 0.01)
    center[2] += (pos[2] * 0.01)
    nVertex = matrixRotating(nVertex, lrTurn * 1.5, center[0], center[2])
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nVertex), gl.STATIC_DRAW)

    //console.log(nVertex);
}

var pointArr = [0, 15, 18, 21, 33, 45]

function cekBoundary() {
    for (var i = 0; i < pos.length; i++) {
        for (var k = 0; k < pointArr.length; k++) {
            if (nVertex[pointArr[k] + i] >= 1 || nVertex[pointArr[k] + i] <= -1) {
                pos[i] *= -1
                lrTurn *= -1
                break
            }
        }
    }
}

function tick() {
    requestAnimationFrame(tick)
    drawScene()
    handleKeys()
    animate()
}

function webGLStart() {
    var canvas = document.getElementById('mycanvas')
    initGL(canvas)
    initShaders()
    drawBoxWireframe()
    drawLetterN()
    //initBuffers()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    document.onkeydown = handleKeyDown
    document.onkeyup = handleKeyUp

    tick()
}
