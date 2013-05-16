onload = function(){

    // canvasエレメントを取得
    var c = document.getElementById('canvas');
    c.width = 512;
    c.height = 512;
    
    // webglコンテキストを取得
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    webgl.GL.CONTEXT = gl;

    initWebGLContents( c, gl );

}

function initWebGLContents( c, gl ){

    // --- Matrix.
    // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    var m = new matIV();

    // --- クォータニオン.
    var q = new qtnIV();
    var qt = q.identity(q.create());

    // --- 
    c.addEventListener( 'mousemove', function(e){
        var cw = c.width;
        var ch = c.height;
        var wh = 1 / Math.sqrt(cw * cw + ch * ch);
        var x = e.clientX - c.offsetLeft - cw * 0.5;
        var y = e.clientY - c.offsetTop - ch * 0.5;
        var sq = Math.sqrt(x * x + y * y);
        var r = sq * 2.0 * Math.PI * wh;
        if(sq != 1){
            sq = 1 / sq;
            x *= sq;
            y *= sq;
        }
        q.rotate(r, [y, x, 0.0], qt);
    }, true );


    // 各種行列の生成と初期化
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var vpMatrix  = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());

    var tmpMatrix = m.identity(m.create());
    var invMatrix = m.identity(m.create());

    // --- Offscreen Render ---

    var texPrg = new webgl.Program();
    texPrg.attachShader(webgl.Shader.createFromElement('texvs'))
     .attachShader(webgl.Shader.createFromElement('texfs'))
     .linkProgram();


    var p = new webgl.Program();
    p.attachShader(webgl.Shader.createFromElement('vs'))
     .attachShader(webgl.Shader.createFromElement('fs'))
     .linkProgram();


    //var torus = new webgl.model.Torus(32, 32, 0.5, 1 );//, [1.0,1.0,1.0,1.0]);
    torus = new webgl.model.Cube(3,[1.0,1.0,1.0,1.0]);
    //torus = new webgl.model.Sphere( 20, 20, 1, [1.0,1.0,1.0,1.0] );
    var ibo   = new webgl.IBO( torus.index );
    var vbos  = [];
    vbos['position'] = new webgl.VBO( torus.position, 3 );
    vbos['normal']   = new webgl.VBO( torus.normal, 3 );
    vbos['color']    = new webgl.VBO( torus.color, 4 );

    var skyBox = new webgl.SkyBox(
        './texture/cube_PX.png',
        './texture/cube_PY.png',
        './texture/cube_PZ.png',
        './texture/cube_NX.png',
        './texture/cube_NY.png',
        './texture/cube_NZ.png'
    );
    var ibo3 = new webgl.IBO( skyBox.cube.index );
    var vbos3 = [];
    vbos3['position'] = new webgl.VBO( skyBox.cube.position, 3 );
    vbos3['normal']   = new webgl.VBO( skyBox.cube.normal, 3 );
    vbos3['color']    = new webgl.VBO( skyBox.cube.color, 4 );

    // --- Main Render ---

    var quad = new webgl.model.Quad();
    var p2 = new webgl.Program();
    p2.attachShader(webgl.Shader.createFromElement('bvs'))
      .attachShader(webgl.Shader.createFromElement('bfs'))
      .linkProgram();
    p2.addVBO( 'position', new webgl.VBO( quad.position, 3 ) )
      .addVBO( 'color', new webgl.VBO( quad.color, 4 ) );
    var ibo2 = new webgl.IBO( quad.index );

    // --- Frame Buffer ---

    var frameBuffer = new webgl.FrameBuffer( 512, 512 );

    var texture = new webgl.Texture('./texture/toon.png');
    gl.activeTexture(gl.TEXTURE0);

    // ---

    var count = 0;
    var rad = 0;
    var camUp = [];

    var lightDirection = [-0.5,0.5,0.5];
    var eyeDirection   = [0.0,0.0,20.0];
    var eyePosition    = [0.0, 0.0, 20.0];
    var ambientColor   = [0.1,0.1,0.1,1.0];

    // --- Render Loop. ---
    
    (function(){

        count++;
        rad = (count%360) * Math.PI / 180;
        lightDirection[1] = 0.5 + Math.sin(rad);
        
        q.toVecIII([0.0, 0.0, 20.0], qt, eyePosition);
        q.toVecIII([0.0, 1.0, 0.0], qt, camUp);

        // --- Frame Buffer ----

        frameBuffer.bind();

        // canvasを初期化.
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // --- Camera

        // ビュー座標変換行列 / プロジェクション座標変換行列 の生成
        m.lookAt(eyePosition, [0, 0, 0], camUp, vMatrix);
        m.perspective(45, frameBuffer.width / frameBuffer.height, 0.1, 200, pMatrix);
        m.multiply(pMatrix, vMatrix, vpMatrix);

        m.identity(mMatrix);
        m.scale(mMatrix, [100.0, 100.0, 100.0], mMatrix);
        m.multiply(vpMatrix, mMatrix, mvpMatrix);

        // --- Texture

        // TEXTURE0 に cubeTexture を適用.
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyBox.cubeTexture);

        // --- Draw SkyBox ---

        var prg = texPrg;
        prg.clear();
        for( var key in vbos3 ){
            prg.addVBO( key, vbos3[key] );
        }
        prg.setIBO(ibo3)
           .useProgram()
           .uniformMatrix4fv('mMatrix', false, mMatrix )
           .uniformMatrix4fv('mvpMatrix', false, mvpMatrix )
           .uniform3fv('eyePosition', eyePosition)
           .uniform1i('cubeTexture', 0)
           .uniform1i('reflection', false);

        gl.drawElements(gl.TRIANGLES, prg.ibo.length, gl.UNSIGNED_SHORT, 0);

        // --- Draw next Primitives. ---

        m.identity(mMatrix);

        prg.clear();
        for( var key in vbos ){
            prg.addVBO( key, vbos[key] );
        }
        prg.setIBO(ibo)
           .useProgram()
           .uniform1i('reflection', true);

        var cnt = count;
        for( var i = 0; i < 1; i++ ){
            
            cnt++;

            //m.scale(mMatrix, [50.0, 50.0, 50.0], mMatrix);
            m.rotate(mMatrix,rad,[1,1,1], mMatrix);
            m.translate(mMatrix,[1.5*Math.sin(cnt/100),0,1.5*Math.cos(cnt/100),0],mMatrix);
            m.inverse( mMatrix, invMatrix );
            m.multiply(vpMatrix, mMatrix, mvpMatrix);

            prg.uniformMatrix4fv('mMatrix', false, mMatrix)
               .uniformMatrix4fv('mvpMatrix', false, mvpMatrix);

            // モデルの描画
            gl.drawElements(gl.TRIANGLES, prg.ibo.length, gl.UNSIGNED_SHORT, 0);

        }


        // ---

        //*
        frameBuffer.unbind();

        // --- Main Rendering ----

        // canvasを初期化.
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindTexture( gl.TEXTURE_2D, frameBuffer.fTexture );

        m.lookAt([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0, 1, 0], vMatrix);
        m.ortho(-1.0, 1.0, 1.0, -1.0, 0.1, 1, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);

        m.identity(mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);

        p2.setIBO(ibo2)
          .useProgram()
          .uniformMatrix4fv( 'mvpMatrix', false, mvpMatrix )
          .uniform1i( 'texture', 0 )
          .uniform1f( 'texSize', 512 )
          .uniform1i( 'useBlur', false );

        gl.drawElements(gl.TRIANGLES, p2.ibo.length, gl.UNSIGNED_SHORT, 0);

        //*/

        // コンテキストの再描画
        gl.flush();
        
        setTimeout(arguments.callee,10);

    })();

};