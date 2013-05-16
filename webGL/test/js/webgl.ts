module webgl{

	export class GL{
		static public CONTEXT;
	}

	export class Shader{

		static public createFromElement(id:string){
			
			var gl = GL.CONTEXT,
				elem:HTMLElement = document.getElementById(id),
				shader;

	        switch(elem['type']){
	            case 'x-shader/x-vertex':
	                shader = gl.createShader(gl.VERTEX_SHADER);
	                break;
	            case 'x-shader/x-fragment':
	                shader = gl.createShader(gl.FRAGMENT_SHADER);
	                break;
	            default :
	                return;
	        }

	        gl.shaderSource( shader, elem['text'] );
        	gl.compileShader(shader);

	        // シェーダが正しくコンパイルされたかチェック
	        if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ){
	        	throw new Error(gl.getShaderInfoLog(shader));
	        }

	        return shader;

		}
        
	}

	// ==========================================================================
	// === Program.

	export class Program{
        
		public ibo:IBO;

		private _program;
		private _vbo:VBO[];
		private _location:number[];
		private _uniform;
		private _linkStatus:Boolean;

		constructor(){
			this._program  = GL.CONTEXT.createProgram();
			this._vbo      = [];
			this._location = [];
			this._uniform  = [];
		}

		public getProgram(){
			return this._program;
		}

		public attachShader( shader ):Program{
			GL.CONTEXT.attachShader( this._program, shader );
			return this;
		}

		public linkProgram():Boolean{
			// Link 済みの場合はそのままリターン.
			if( this._linkStatus == true ){
				return true;
			}
			GL.CONTEXT.linkProgram( this._program );
			this._linkStatus = GL.CONTEXT.getProgramParameter(this._program, GL.CONTEXT.LINK_STATUS);
	        // シェーダのリンクが正しく行なわれたかチェック
	        if( this._linkStatus == true ){
	            // 成功していたらプログラムオブジェクトを有効にする
	            GL.CONTEXT.useProgram(this._program);
	            // プログラムオブジェクトを返して終了
	            return this._program;
	        }else{
	            // 失敗していたらエラーログをアラートする
	        	throw new Error(GL.CONTEXT.getShaderInfoLog(this._program));
	        }
		}

		public addVBO( attributeName:string, vbo:VBO ):Program{
	        var gl       = GL.CONTEXT,
	        	location = gl.getAttribLocation( this._program, attributeName );
	        this._vbo.push( vbo );
	        this._location.push( location );
	        return this;
	    }

	    public setIBO( ibo:IBO ):Program{
    		this.ibo = ibo;
    		return this;
	    }

		public clear():void{
			this.ibo = null;
			this._vbo      = [];
			this._location = [];
	        GL.CONTEXT.bindBuffer(GL.CONTEXT.ARRAY_BUFFER, null);
	        GL.CONTEXT.bindBuffer(GL.CONTEXT.ELEMENT_ARRAY_BUFFER, null);
		}

		public useProgram():Program{
			GL.CONTEXT.useProgram( this._program );
			this.bind();
			return this;
		}

		/**
		 * VBO を bind して Program を利用する準備を行います.
		 */
	    public bind(){
	    	var gl = GL.CONTEXT;
	    	for( var i = 0; i < this._vbo.length; i++ ){
	    		var vbo = this._vbo[i];
	    		var location = this._location[i];
		        gl.bindBuffer(gl.ARRAY_BUFFER, vbo.buffer);
	    	    gl.enableVertexAttribArray(location);
	        	gl.vertexAttribPointer(location, vbo.stride, gl.FLOAT, false, 0, 0);
	    	}
	    	if( this.ibo != null ){
	    		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo.buffer );
	    	}
		}

		// --- Uniform Functions. ----------------------

		/**
		 * 引数で指定した key の uniform 位置を取得します.
		 * @param uniformKey
		 */
		public getUniformLocation( uniformKey:string ):number{
			if( !this._uniform[uniformKey] ){
				this._uniform[uniformKey] = GL.CONTEXT.getUniformLocation( this._program, uniformKey );
			}
			return this._uniform[uniformKey];
		}

		public uniform3fv( uniformKey:string, value ):Program{
			GL.CONTEXT.uniform3fv( this.getUniformLocation(uniformKey), value );
			return this;
		}

		public uniform4fv( uniformKey:string, value ):Program{
			GL.CONTEXT.uniform4fv( this.getUniformLocation(uniformKey), value );
			return this;
		}

		public uniform1i( uniformKey:string, value:number ):Program{
			GL.CONTEXT.uniform1i( this.getUniformLocation(uniformKey), value );
			return this;
		}
		
		public uniform1f( uniformKey:string, value:number ):Program{
			GL.CONTEXT.uniform1f( this.getUniformLocation(uniformKey), value );
			return this;
		}

		public uniformMatrix4fv( uniformKey:string, bool:Boolean, value ):Program{
			GL.CONTEXT.uniformMatrix4fv( this.getUniformLocation(uniformKey), bool, value );
			return this;
		}

	}

	// ==========================================================================
	// === Buffer Object.

	/**
	 * Vertex Buffer Object.
	 */
	export class VBO{

		// ------- MEMBER -----------------------------------

		public buffer;
		public stride:number;
		public length:number;

		// ------- PUBLIC -----------------------------------

		constructor( data:number[], stride:number ){
			
			var gl = GL.CONTEXT;

			// バッファオブジェクトの生成
	        var buff = gl.createBuffer();
	        // バッファをバインドする
	        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
	        // バッファにデータをセット
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	        // バッファのバインドを無効化
	        gl.bindBuffer(gl.ARRAY_BUFFER, null);

			this.buffer = buff;
			this.stride = stride;
			this.length = data.length;

		}

	}

	/**
	 * Index Buffer Object.
	 */
	export class IBO{

		// ------- MEMBER -----------------------------------

		public buffer;
		public length:number;

		// ------- PUBLIC -----------------------------------

		constructor( data:number[] ){
			
			var gl = GL.CONTEXT;
			
			// バッファオブジェクトの生成
	        var buff = gl.createBuffer();
	        // バッファをバインドする
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
	        // バッファにデータをセット
	        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
	        // バッファのバインドを無効化
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	        this.buffer = buff;
	        this.length = data.length;

		}

	}

	export class FrameBuffer{

		// ------- MEMBER -----------------------------------

		public frameBuffer;
		public depthRenderBuffer;
		public fTexture;

		// ------- PUBLIC -----------------------------------

		constructor( public width, public height ){
			
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

			this.frameBuffer       = frameBuffer;
			this.depthRenderBuffer = depthRenderBuffer;
			this.fTexture          = fTexture;

		}

		public bind(){
			var gl = GL.CONTEXT;
			gl.bindFramebuffer( gl.FRAMEBUFFER, this.frameBuffer );
		}

		public unbind(){
			var gl = GL.CONTEXT;
			gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		}

	}

	// ==========================================================================
	// === Texture Object.

	export class Texture{

		// ------- MEMBER -----------------------------------

		private _img;
		public texture;
		public loaded:Boolean;

		// ------- PUBLIC -----------------------------------

		constructor( source ){
			var that = this;
			this._img = new Image();
			this._img.onload = function(){
				that._onImgLoaded();
			}
			this._img.src = source;
		}

		public bind( index:number ):void{
			var gl = GL.CONTEXT;
			gl.activeTexture( gl['TEXTURE'+index] );
			gl.bindTexture( gl.TEXTURE_2D, this.texture );
		}

		// ------- PRIVATE ----------------------------------

		private _onImgLoaded(){

			var gl  = GL.CONTEXT;

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

		}

	}

	export class Loader{

		public image;
		public loaded:Boolean;

		constructor( source:string, onLoad:Function = null ){
			this.image = new Image();
			var that = this;
			this.image.onload = function(){
				that.loaded = true;
				if( onLoad ) onLoad();
			};
			this.image.src = source;
		}

	}

	export class SkyBox{

		private _source;
		private _target;

		public cube:model.Cube;
		public cubeTexture;

		constructor( positiveX:string, positiveY:string, positiveZ:string,
					 negativeX:string, negativeY:string, negativeZ:string ){

			var gl   = GL.CONTEXT;
			var that = this;

			var checkLoaded = function(){
				if( that._source[0].loaded &&
					that._source[1].loaded &&
					that._source[2].loaded &&
					that._source[3].loaded &&
					that._source[4].loaded &&
					that._source[5].loaded ){
					that.generateCubeMap();
				}
			}

			this._source = [];
			this._target = [];

			this._source[0] = new Loader( positiveX, checkLoaded );
			this._target[0] = gl.TEXTURE_CUBE_MAP_POSITIVE_X;

			this._source[1] = new Loader( positiveY, checkLoaded );
			this._target[1] = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;

			this._source[2] = new Loader( positiveZ, checkLoaded );
			this._target[2] = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
			
			this._source[3] = new Loader( negativeX, checkLoaded );
			this._target[3] = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
			
			this._source[4] = new Loader( negativeY, checkLoaded );
			this._target[4] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
			
			this._source[5] = new Loader( negativeZ, checkLoaded );
			this._target[5] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;

			this.cube = new model.Cube(2.0,[1.0,1.0,1.0,1.0]);

		}
		
		public generateCubeMap(){

			var gl = GL.CONTEXT;

			var tex = gl.createTexture();
			
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

			for(var j = 0; j < 6; j++){
				// ãƒ†ã‚¯ã‚¹ãƒãƒ£ã¸ã‚¤ãƒ¡ãƒ¼ã‚¸ã‚’é©ç”¨
				gl.texImage2D(this._target[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._source[j].image);
			}
			
			// ãƒŸãƒƒãƒ—ãƒžãƒƒãƒ—ã‚’ç”Ÿæˆ
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			
			// ãƒ†ã‚¯ã‚¹ãƒãƒ£ãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿ã®è¨­å®š
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			
			// ã‚­ãƒ¥ãƒ¼ãƒ–ãƒžãƒƒãƒ—ãƒ†ã‚¯ã‚¹ãƒãƒ£ã‚’å¤‰æ•°ã«ä»£å…¥
			this.cubeTexture = tex;
			
			// ãƒ†ã‚¯ã‚¹ãƒãƒ£ã®ãƒã‚¤ãƒ³ãƒ‰ã‚’ç„¡åŠ¹åŒ–
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

		}

	}




	export module model{

		export class ModelBase{

			public position:number[];
			public normal:number[];
			public color:number[];
			public index:number[];
			public textureCoord:number[];

			constructor(){}
			
			public hsva(h:number, s:number, v:number, a:number){
			    if(s > 1 || v > 1 || a > 1){
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
			}

		}

		export class Torus extends ModelBase{

			constructor(row:number = 10, column:number = 10, irad:number = 1, orad:number = 2, color:number[] = null ){
				
				super();

				var pos:number[] = [],
					nor:number[] = [],
					col:number[] = [],
					idx:number[] = [];

			    for(var i = 0; i <= row; i++){
			        var r = Math.PI * 2 / row * i;
			        var rr = Math.cos(r);
			        var ry = Math.sin(r);
			        for(var ii = 0; ii <= column; ii++){
			        	// 座標
			            var tr = Math.PI * 2 / column * ii;
			            var tx = (rr * irad + orad) * Math.cos(tr);
			            var ty = ry * irad;
			            var tz = (rr * irad + orad) * Math.sin(tr);
			            pos.push(tx, ty, tz);
			            // 法線ベクトル
			            var rx = rr * Math.cos(tr);
        			    var rz = rr * Math.sin(tr);
			            nor.push(rx, ry, rz);
			            // 色
			            if( color ){
				            col.push(color[0], color[1], color[2], color[3]);
		            	}else{
			            	var tc = this.hsva(360 / column * ii, 1, 1, 1);
				            col.push(tc[0], tc[1], tc[2], tc[3]);
		            	}
			        }
			    }

			    for(i = 0; i < row; i++){
			        for(ii = 0; ii < column; ii++){
			            r = (row + 1) * ii + i;
			            idx.push(r, r + row + 2, r + 1);
			            idx.push(r, r + row + 1, r + row + 2);
			        }
			    }

			    this.position = pos;
			    this.normal   = nor;
			    this.color    = col;
			    this.index    = idx;

			}

		}

		export class Quad extends ModelBase{

			constructor(){

				super();

				// 頂点の位置.
				this.position = [
				    -1.0,  1.0,  0.0,
				     1.0,  1.0,  0.0,
				    -1.0, -1.0,  0.0,
				     1.0, -1.0,  0.0
				];

				// 法線ベクトル.
				this.normal = [
					0.0, 0.0, -1.0,
					0.0, 0.0, -1.0,
					0.0, 0.0, -1.0,
					0.0, 0.0, -1.0
				];

				// 頂点色.
				this.color = [
				    1.0, 1.0, 1.0, 1.0,
				    1.0, 1.0, 1.0, 1.0,
				    1.0, 1.0, 1.0, 1.0,
				    1.0, 1.0, 1.0, 1.0
				];

				// テクスチャ座標.
				this.textureCoord = [
				    0.0, 0.0,
				    1.0, 0.0,
				    0.0, 1.0,
				    1.0, 1.0
				];

				this.index = [
					0, 1, 2,
					3, 2, 1
				];

			}


		}

		export class Sphere extends ModelBase{

			constructor(row:number, column:number, rad:number, color:number[] = null){

				super();

				var pos = new Array(), nor = new Array(),
				    col = new Array(), st  = new Array(), idx = new Array();
				for(var i = 0; i <= row; i++){
					var r = Math.PI / row * i;
					var ry = Math.cos(r);
					var rr = Math.sin(r);
					for(var ii = 0; ii <= column; ii++){
						var tr = Math.PI * 2 / column * ii;
						var tx = rr * rad * Math.cos(tr);
						var ty = ry * rad;
						var tz = rr * rad * Math.sin(tr);
						var rx = rr * Math.cos(tr);
						var rz = rr * Math.sin(tr);
						if(color){
							var tc = color;
						}else{
							tc = this.hsva(360 / row * i, 1, 1, 1);
						}
						pos.push(tx, ty, tz);
						nor.push(rx, ry, rz);
						col.push(tc[0], tc[1], tc[2], tc[3]);
						st.push(1 - 1 / column * ii, 1 / row * i);
					}
				}
				r = 0;
				for(i = 0; i < row; i++){
					for(ii = 0; ii < column; ii++){
						r = (column + 1) * i + ii;
						idx.push(r, r + 1, r + column + 2);
						idx.push(r, r + column + 2, r + column + 1);
					}
				}

				this.position = pos;
				this.normal   = nor;
				this.color    = col;
				this.index    = idx;

			}

		}

		export class Cube extends ModelBase{

			constructor( side:number = 1.0, color:number[] = null ){

				super();

				var hs = side * 0.5;
				var pos = [
					-hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,  hs,
					-hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs,
					-hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs,  hs,  hs, -hs,
					-hs, -hs, -hs,  hs, -hs, -hs,  hs, -hs,  hs, -hs, -hs,  hs,
					 hs, -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,
					-hs, -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs
				];
				var nor = [
					-1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
					-1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
					-1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
					-1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
					 1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
					-1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
				];
				var col = new Array();
				for(var i = 0; i < pos.length / 3; i++){
					if(color){
						var tc = color;
					}else{
						tc = this.hsva(360 / pos.length / 3 * i, 1, 1, 1);
					}
					col.push(tc[0], tc[1], tc[2], tc[3]);
				}
				var st = [
					0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
					0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
					0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
					0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
					0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
					0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
				];
				var idx = [
					 0,  1,  2,  0,  2,  3,
					 4,  5,  6,  4,  6,  7,
					 8,  9, 10,  8, 10, 11,
					12, 13, 14, 12, 14, 15,
					16, 17, 18, 16, 18, 19,
					20, 21, 22, 20, 22, 23
				];

				this.position = pos;
				this.normal   = nor;
				this.color    = col;
				// this.t     = st;
				this.index    = idx;

			}

		}

	}

}