import '@testing-library/jest-dom/vitest';

// Mock WebGL / Canvas for Three.js
HTMLCanvasElement.prototype.getContext = ((origGetContext) => {
  return function (this: HTMLCanvasElement, contextId: string, options?: unknown) {
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return {
        canvas: this,
        drawingBufferWidth: 300,
        drawingBufferHeight: 150,
        getExtension: () => null,
        getParameter: () => 0,
        createShader: () => ({}),
        shaderSource: () => {},
        compileShader: () => {},
        getShaderParameter: () => true,
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        getProgramParameter: () => true,
        useProgram: () => {},
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        enable: () => {},
        disable: () => {},
        depthFunc: () => {},
        blendFunc: () => {},
        viewport: () => {},
        clear: () => {},
        clearColor: () => {},
        createTexture: () => ({}),
        bindTexture: () => {},
        texImage2D: () => {},
        texParameteri: () => {},
        createFramebuffer: () => ({}),
        bindFramebuffer: () => {},
        framebufferTexture2D: () => {},
        createRenderbuffer: () => ({}),
        bindRenderbuffer: () => {},
        renderbufferStorage: () => {},
        framebufferRenderbuffer: () => {},
        checkFramebufferStatus: () => 36053,
        getAttribLocation: () => 0,
        getUniformLocation: () => ({}),
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        uniform1f: () => {},
        uniform1i: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniformMatrix4fv: () => {},
        drawArrays: () => {},
        drawElements: () => {},
        pixelStorei: () => {},
        activeTexture: () => {},
        generateMipmap: () => {},
        deleteTexture: () => {},
        deleteBuffer: () => {},
        deleteShader: () => {},
        deleteProgram: () => {},
        deleteFramebuffer: () => {},
        deleteRenderbuffer: () => {},
        getShaderInfoLog: () => '',
        getProgramInfoLog: () => '',
        scissor: () => {},
        colorMask: () => {},
        stencilFunc: () => {},
        stencilOp: () => {},
        stencilMask: () => {},
        depthMask: () => {},
        cullFace: () => {},
        frontFace: () => {},
        lineWidth: () => {},
        polygonOffset: () => {},
        blendEquation: () => {},
        blendFuncSeparate: () => {},
        blendEquationSeparate: () => {},
        sampleCoverage: () => {},
      };
    }
    return origGetContext.call(this, contextId, options);
  };
})(HTMLCanvasElement.prototype.getContext);

// Mock AudioContext
class MockAnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  smoothingTimeConstant = 0.8;
  getByteFrequencyData(arr: Uint8Array) { arr.fill(128); }
  getByteTimeDomainData(arr: Uint8Array) { arr.fill(128); }
  connect() { return this; }
  disconnect() {}
}

class MockAudioContext {
  state = 'running';
  destination = {};
  createAnalyser() { return new MockAnalyserNode(); }
  createMediaStreamSource() { return { connect: () => {}, disconnect: () => {} }; }
  createMediaElementSource() { return { connect: () => {}, disconnect: () => {} }; }
  close() {}
}

Object.defineProperty(globalThis, 'AudioContext', { value: MockAudioContext, writable: true });

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: async () => ({
      getTracks: () => [{ stop: () => {} }],
    }),
  },
  writable: true,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, 'ResizeObserver', { value: MockResizeObserver, writable: true });

// Mock requestAnimationFrame
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}
