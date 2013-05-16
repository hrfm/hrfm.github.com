var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var webgl;
(function (webgl) {
    var GL = (function () {
        function GL() { }
        GL.CONTEXT = undefined;
        return GL;
    })();
    webgl.GL = GL;    
    var Shader = (function () {
        function Shader() { }
        Shader.createFromElement = function createFromElement(id) {
            var gl = GL.CONTEXT, elem = document.getElementById(id), shader;
            switch(elem['type']) {
                case 'x-shader/x-vertex': {
                    shader = gl.createShader(gl.VERTEX_SHADER);
                    break;

                }
                case 'x-shader/x-fragment': {
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                    break;

                }
                default: {
                    return;

                }
            }
            gl.shaderSource(shader, elem['text']);
            gl.compileShader(shader);
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(shader));
            }
            return shader;
        }
        return Shader;
    })();
    webgl.Shader = Shader;    
    var Program = (function () {
        function Program() {
            this._program = GL.CONTEXT.createProgram();
            this._vbo = [];
            this._location = [];
            this._uniform = [];
        }
        Program.prototype.getProgram = function () {
            return this._program;
        };
        Program.prototype.attachShader = function (shader) {
            GL.CONTEXT.attachShader(this._program, shader);
            return this;
        };
        Program.prototype.linkProgram = function () {
            if(this._linkStatus == true) {
                return true;
            }
            GL.CONTEXT.linkProgram(this._program);
            this._linkStatus = GL.CONTEXT.getProgramParameter(this._program, GL.CONTEXT.LINK_STATUS);
            if(this._linkStatus == true) {
                GL.CONTEXT.useProgram(this._program);
                return this._program;
            } else {
                throw new Error(GL.CONTEXT.getShaderInfoLog(this._program));
            }
        };
        Program.prototype.addVBO = function (attributeName, vbo) {
            var gl = GL.CONTEXT, location = gl.getAttribLocation(this._program, attributeName);
            this._vbo.push(vbo);
            this._location.push(location);
            return this;
        };
        Program.prototype.setIBO = function (ibo) {
            this.ibo = ibo;
            return this;
        };
        Program.prototype.clear = function () {
            this.ibo = null;
            this._vbo = [];
            this._location = [];
            GL.CONTEXT.bindBuffer(GL.CONTEXT.ARRAY_BUFFER, null);
            GL.CONTEXT.bindBuffer(GL.CONTEXT.ELEMENT_ARRAY_BUFFER, null);
        };
        Program.prototype.useProgram = function () {
            GL.CONTEXT.useProgram(this._program);
            this.bind();
            return this;
        };
        Program.prototype.bind = function () {
            var gl = GL.CONTEXT;
            for(var i = 0; i < this._vbo.length; i++) {
                var vbo = this._vbo[i];
                var location = this._location[i];
                gl.bindBuffer(gl.ARRAY_BUFFER, vbo.buffer);
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, vbo.stride, gl.FLOAT, false, 0, 0);
            }
            if(this.ibo != null) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo.buffer);
            }
        };
        Program.prototype.getUniformLocation = function (uniformKey) {
            if(!this._uniform[uniformKey]) {
                this._uniform[uniformKey] = GL.CONTEXT.getUniformLocation(this._program, uniformKey);
            }
            return this._uniform[uniformKey];
        };
        Program.prototype.uniform3fv = function (uniformKey, value) {
            GL.CONTEXT.uniform3fv(this.getUniformLocation(uniformKey), value);
            return this;
        };
        Program.prototype.uniform4fv = function (uniformKey, value) {
            GL.CONTEXT.uniform4fv(this.getUniformLocation(uniformKey), value);
            return this;
        };
        Program.prototype.uniform1i = function (uniformKey, value) {
            GL.CONTEXT.uniform1i(this.getUniformLocation(uniformKey), value);
            return this;
        };
        Program.prototype.uniform1f = function (uniformKey, value) {
            GL.CONTEXT.uniform1f(this.getUniformLocation(uniformKey), value);
            return this;
        };
        Program.prototype.uniformMatrix4fv = function (uniformKey, bool, value) {
            GL.CONTEXT.uniformMatrix4fv(this.getUniformLocation(uniformKey), bool, value);
            return this;
        };
        return Program;
    })();
    webgl.Program = Program;    
    var VBO = (function () {
        function VBO(data, stride) {
            var gl = GL.CONTEXT;
            var buff = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buff);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.buffer = buff;
            this.stride = stride;
            this.length = data.length;
        }
        return VBO;
    })();
    webgl.VBO = VBO;    
    var IBO = (function () {
        function IBO(data) {
            var gl = GL.CONTEXT;
            var buff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            this.buffer = buff;
            this.length = data.length;
        }
        return IBO;
    })();
    webgl.IBO = IBO;    
    var FrameBuffer = (function () {
        function FrameBuffer(width, height) {
            this.width = width;
            this.height = height;
            var gl = GL.CONTEXT;
            var frameBuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
            var depthRenderBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
            var fTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, fTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.frameBuffer = frameBuffer;
            this.depthRenderBuffer = depthRenderBuffer;
            this.fTexture = fTexture;
        }
        FrameBuffer.prototype.bind = function () {
            var gl = GL.CONTEXT;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        };
        FrameBuffer.prototype.unbind = function () {
            var gl = GL.CONTEXT;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };
        return FrameBuffer;
    })();
    webgl.FrameBuffer = FrameBuffer;    
    var Texture = (function () {
        function Texture(source) {
            var that = this;
            this._img = new Image();
            this._img.onload = function () {
                that._onImgLoaded();
            };
            this._img.src = source;
        }
        Texture.prototype.bind = function (index) {
            var gl = GL.CONTEXT;
            gl.activeTexture(gl['TEXTURE' + index]);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        };
        Texture.prototype._onImgLoaded = function () {
            var gl = GL.CONTEXT;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this.loaded = true;
        };
        return Texture;
    })();
    webgl.Texture = Texture;    
    var Loader = (function () {
        function Loader(source, onLoad) {
            if (typeof onLoad === "undefined") { onLoad = null; }
            this.image = new Image();
            var that = this;
            this.image.onload = function () {
                that.loaded = true;
                if(onLoad) {
                    onLoad();
                }
            };
            this.image.src = source;
        }
        return Loader;
    })();
    webgl.Loader = Loader;    
    var SkyBox = (function () {
        function SkyBox(positiveX, positiveY, positiveZ, negativeX, negativeY, negativeZ) {
            var gl = GL.CONTEXT;
            var that = this;
            var checkLoaded = function () {
                if(that._source[0].loaded && that._source[1].loaded && that._source[2].loaded && that._source[3].loaded && that._source[4].loaded && that._source[5].loaded) {
                    that.generateCubeMap();
                }
            };
            this._source = [];
            this._target = [];
            this._source[0] = new Loader(positiveX, checkLoaded);
            this._target[0] = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
            this._source[1] = new Loader(positiveY, checkLoaded);
            this._target[1] = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
            this._source[2] = new Loader(positiveZ, checkLoaded);
            this._target[2] = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
            this._source[3] = new Loader(negativeX, checkLoaded);
            this._target[3] = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
            this._source[4] = new Loader(negativeY, checkLoaded);
            this._target[4] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
            this._source[5] = new Loader(negativeZ, checkLoaded);
            this._target[5] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
            this.cube = new model.Cube(2, [
                1, 
                1, 
                1, 
                1
            ]);
        }
        SkyBox.prototype.generateCubeMap = function () {
            var gl = GL.CONTEXT;
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
            for(var j = 0; j < 6; j++) {
                gl.texImage2D(this._target[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._source[j].image);
            }
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            this.cubeTexture = tex;
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        };
        return SkyBox;
    })();
    webgl.SkyBox = SkyBox;    
    (function (model) {
        var ModelBase = (function () {
            function ModelBase() {
            }
            ModelBase.prototype.hsva = function (h, s, v, a) {
                if(s > 1 || v > 1 || a > 1) {
                    return;
                }
                var th = h % 360;
                var i = Math.floor(th / 60);
                var f = th / 60 - i;
                var m = v * (1 - s);
                var n = v * (1 - s * f);
                var k = v * (1 - s * (1 - f));
                var color = new Array();
                var r = new Array(v, n, m, m, k, v);
                var g = new Array(k, v, v, n, m, m);
                var b = new Array(m, m, k, v, v, n);
                color.push(r[i], g[i], b[i], a);
                return color;
            };
            return ModelBase;
        })();
        model.ModelBase = ModelBase;        
        var Torus = (function (_super) {
            __extends(Torus, _super);
            function Torus(row, column, irad, orad, color) {
                if (typeof row === "undefined") { row = 10; }
                if (typeof column === "undefined") { column = 10; }
                if (typeof irad === "undefined") { irad = 1; }
                if (typeof orad === "undefined") { orad = 2; }
                if (typeof color === "undefined") { color = null; }
                        _super.call(this);
                var pos = [], nor = [], col = [], idx = [];
                for(var i = 0; i <= row; i++) {
                    var r = Math.PI * 2 / row * i;
                    var rr = Math.cos(r);
                    var ry = Math.sin(r);
                    for(var ii = 0; ii <= column; ii++) {
                        var tr = Math.PI * 2 / column * ii;
                        var tx = (rr * irad + orad) * Math.cos(tr);
                        var ty = ry * irad;
                        var tz = (rr * irad + orad) * Math.sin(tr);
                        pos.push(tx, ty, tz);
                        var rx = rr * Math.cos(tr);
                        var rz = rr * Math.sin(tr);
                        nor.push(rx, ry, rz);
                        if(color) {
                            col.push(color[0], color[1], color[2], color[3]);
                        } else {
                            var tc = this.hsva(360 / column * ii, 1, 1, 1);
                            col.push(tc[0], tc[1], tc[2], tc[3]);
                        }
                    }
                }
                for(i = 0; i < row; i++) {
                    for(ii = 0; ii < column; ii++) {
                        r = (row + 1) * ii + i;
                        idx.push(r, r + row + 2, r + 1);
                        idx.push(r, r + row + 1, r + row + 2);
                    }
                }
                this.position = pos;
                this.normal = nor;
                this.color = col;
                this.index = idx;
            }
            return Torus;
        })(ModelBase);
        model.Torus = Torus;        
        var Quad = (function (_super) {
            __extends(Quad, _super);
            function Quad() {
                        _super.call(this);
                this.position = [
                    -1, 
                    1, 
                    0, 
                    1, 
                    1, 
                    0, 
                    -1, 
                    -1, 
                    0, 
                    1, 
                    -1, 
                    0
                ];
                this.normal = [
                    0, 
                    0, 
                    -1, 
                    0, 
                    0, 
                    -1, 
                    0, 
                    0, 
                    -1, 
                    0, 
                    0, 
                    -1
                ];
                this.color = [
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1
                ];
                this.textureCoord = [
                    0, 
                    0, 
                    1, 
                    0, 
                    0, 
                    1, 
                    1, 
                    1
                ];
                this.index = [
                    0, 
                    1, 
                    2, 
                    3, 
                    2, 
                    1
                ];
            }
            return Quad;
        })(ModelBase);
        model.Quad = Quad;        
        var Sphere = (function (_super) {
            __extends(Sphere, _super);
            function Sphere(row, column, rad, color) {
                if (typeof color === "undefined") { color = null; }
                        _super.call(this);
                var pos = new Array(), nor = new Array(), col = new Array(), st = new Array(), idx = new Array();
                for(var i = 0; i <= row; i++) {
                    var r = Math.PI / row * i;
                    var ry = Math.cos(r);
                    var rr = Math.sin(r);
                    for(var ii = 0; ii <= column; ii++) {
                        var tr = Math.PI * 2 / column * ii;
                        var tx = rr * rad * Math.cos(tr);
                        var ty = ry * rad;
                        var tz = rr * rad * Math.sin(tr);
                        var rx = rr * Math.cos(tr);
                        var rz = rr * Math.sin(tr);
                        if(color) {
                            var tc = color;
                        } else {
                            tc = this.hsva(360 / row * i, 1, 1, 1);
                        }
                        pos.push(tx, ty, tz);
                        nor.push(rx, ry, rz);
                        col.push(tc[0], tc[1], tc[2], tc[3]);
                        st.push(1 - 1 / column * ii, 1 / row * i);
                    }
                }
                r = 0;
                for(i = 0; i < row; i++) {
                    for(ii = 0; ii < column; ii++) {
                        r = (column + 1) * i + ii;
                        idx.push(r, r + 1, r + column + 2);
                        idx.push(r, r + column + 2, r + column + 1);
                    }
                }
                this.position = pos;
                this.normal = nor;
                this.color = col;
                this.index = idx;
            }
            return Sphere;
        })(ModelBase);
        model.Sphere = Sphere;        
        var Cube = (function (_super) {
            __extends(Cube, _super);
            function Cube(side, color) {
                if (typeof side === "undefined") { side = 1; }
                if (typeof color === "undefined") { color = null; }
                        _super.call(this);
                var hs = side * 0.5;
                var pos = [
                    -hs, 
                    -hs, 
                    hs, 
                    hs, 
                    -hs, 
                    hs, 
                    hs, 
                    hs, 
                    hs, 
                    -hs, 
                    hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    hs, 
                    hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    hs, 
                    hs, 
                    hs, 
                    hs, 
                    hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    hs, 
                    -hs, 
                    hs, 
                    hs, 
                    hs, 
                    hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    -hs, 
                    hs, 
                    -hs, 
                    hs, 
                    hs, 
                    -hs, 
                    hs, 
                    -hs
                ];
                var nor = [
                    -1, 
                    -1, 
                    1, 
                    1, 
                    -1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    -1, 
                    1, 
                    1, 
                    -1, 
                    -1, 
                    -1, 
                    -1, 
                    1, 
                    -1, 
                    1, 
                    1, 
                    -1, 
                    1, 
                    -1, 
                    -1, 
                    -1, 
                    1, 
                    -1, 
                    -1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    -1, 
                    -1, 
                    -1, 
                    -1, 
                    1, 
                    -1, 
                    -1, 
                    1, 
                    -1, 
                    1, 
                    -1, 
                    -1, 
                    1, 
                    1, 
                    -1, 
                    -1, 
                    1, 
                    1, 
                    -1, 
                    1, 
                    1, 
                    1, 
                    1, 
                    -1, 
                    1, 
                    -1, 
                    -1, 
                    -1, 
                    -1, 
                    -1, 
                    1, 
                    -1, 
                    1, 
                    1, 
                    -1, 
                    1, 
                    -1
                ];
                var col = new Array();
                for(var i = 0; i < pos.length / 3; i++) {
                    if(color) {
                        var tc = color;
                    } else {
                        tc = this.hsva(360 / pos.length / 3 * i, 1, 1, 1);
                    }
                    col.push(tc[0], tc[1], tc[2], tc[3]);
                }
                var st = [
                    0, 
                    0, 
                    1, 
                    0, 
                    1, 
                    1, 
                    0, 
                    1, 
                    0, 
                    0, 
                    1, 
                    0, 
                    1, 
                    1, 
                    0, 
                    1, 
                    0, 
                    0, 
                    1, 
                    0, 
                    1, 
                    1, 
                    0, 
                    1, 
                    0, 
                    0, 
                    1, 
                    0, 
                    1, 
                    1, 
                    0, 
                    1, 
                    0, 
                    0, 
                    1, 
                    0, 
                    1, 
                    1, 
                    0, 
                    1, 
                    0, 
                    0, 
                    1, 
                    0, 
                    1, 
                    1, 
                    0, 
                    1
                ];
                var idx = [
                    0, 
                    1, 
                    2, 
                    0, 
                    2, 
                    3, 
                    4, 
                    5, 
                    6, 
                    4, 
                    6, 
                    7, 
                    8, 
                    9, 
                    10, 
                    8, 
                    10, 
                    11, 
                    12, 
                    13, 
                    14, 
                    12, 
                    14, 
                    15, 
                    16, 
                    17, 
                    18, 
                    16, 
                    18, 
                    19, 
                    20, 
                    21, 
                    22, 
                    20, 
                    22, 
                    23
                ];
                this.position = pos;
                this.normal = nor;
                this.color = col;
                this.index = idx;
            }
            return Cube;
        })(ModelBase);
        model.Cube = Cube;        
    })(webgl.model || (webgl.model = {}));
    var model = webgl.model;
})(webgl || (webgl = {}));
