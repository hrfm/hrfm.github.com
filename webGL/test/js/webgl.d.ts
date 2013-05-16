module webgl {
    class GL {
        static CONTEXT;
    }
    class Shader {
        static createFromElement(id: string);
    }
    class Program {
        public ibo: IBO;
        private _program;
        private _vbo;
        private _location;
        private _uniform;
        private _linkStatus;
        constructor ();
        public getProgram();
        public attachShader(shader): Program;
        public linkProgram(): Boolean;
        public addVBO(attributeName: string, vbo: VBO): Program;
        public setIBO(ibo: IBO): Program;
        public clear(): void;
        public useProgram(): Program;
        public bind(): void;
        public getUniformLocation(uniformKey: string): number;
        public uniform3fv(uniformKey: string, value): Program;
        public uniform4fv(uniformKey: string, value): Program;
        public uniform1i(uniformKey: string, value: number): Program;
        public uniform1f(uniformKey: string, value: number): Program;
        public uniformMatrix4fv(uniformKey: string, bool: Boolean, value): Program;
    }
    class VBO {
        public buffer;
        public stride: number;
        public length: number;
        constructor (data: number[], stride: number);
    }
    class IBO {
        public buffer;
        public length: number;
        constructor (data: number[]);
    }
    class FrameBuffer {
        public width;
        public height;
        public frameBuffer;
        public depthRenderBuffer;
        public fTexture;
        constructor (width, height);
        public bind(): void;
        public unbind(): void;
    }
    class Texture {
        private _img;
        public texture;
        public loaded: Boolean;
        constructor (source);
        public bind(index: number): void;
        private _onImgLoaded();
    }
    class Loader {
        public image;
        public loaded: Boolean;
        constructor (source: string, onLoad?: Function);
    }
    class SkyBox {
        private _source;
        private _target;
        public cube: model.Cube;
        public cubeTexture;
        constructor (positiveX: string, positiveY: string, positiveZ: string, negativeX: string, negativeY: string, negativeZ: string);
        public generateCubeMap(): void;
    }
    module model {
        class ModelBase {
            public position: number[];
            public normal: number[];
            public color: number[];
            public index: number[];
            public textureCoord: number[];
            constructor ();
            public hsva(h: number, s: number, v: number, a: number): any[];
        }
        class Torus extends ModelBase {
            constructor (row?: number, column?: number, irad?: number, orad?: number, color?: number[]);
        }
        class Quad extends ModelBase {
            constructor ();
        }
        class Sphere extends ModelBase {
            constructor (row: number, column: number, rad: number, color?: number[]);
        }
        class Cube extends ModelBase {
            constructor (side?: number, color?: number[]);
        }
    }
}
