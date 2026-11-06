/* Drama Alarm 7.2 — stable touch capture and V3 navigation composition.
   No video frames, optical atlas, photographs, audio or native Apple APIs are used.
   Two locally drawn canvases supply the theme neighborhood and actual navigation
   icon/label content. This is not an arbitrary DOM screenshot. Real DOM buttons
   remain semantic, focusable, and visible whenever rendering is unavailable. */
(function (global) {
  "use strict";

  const DURATION = 1.413333;
  const DRAG_THRESHOLD = 8;
  const HOLD_MS = 180;
  const PAD_X = 24;
  const PAD_Y = 28;
  const ENVELOPE = [
    [0, 0, 1, 0, 0], [.033, .38, 1, .02, 0],
    [.083, .88, 1, .08, .03], [.150, 1, .85, .24, .12],
    [.217, 1, .33, .68, .24], [.317, 1, .05, 1, .40],
    [.485, 1, 0, 1, .60], [.652, .93, 0, 1, .74],
    [.850, .75, 0, 1, .86], [1, .53, 0, 1, .94],
    [1.15, .30, 0, 1, 1], [1.25, .12, 0, 1, 1],
    [1.35, .015, 0, 1, 1], [DURATION, 0, 0, 1, 1]
  ];
  const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, finite(value, low)));
  const smooth = value => { const x = clamp(value, 0, 1); return x * x * (3 - 2 * x); };
  function sampleEnvelope(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0 || seconds >= DURATION) {
      return { energy: 0, sphere: 0, morph: 1, echo: 1 };
    }
    let index = 0;
    while (index < ENVELOPE.length - 2 && seconds > ENVELOPE[index + 1][0]) index++;
    const a = ENVELOPE[index], b = ENVELOPE[index + 1];
    const mix = smooth((seconds - a[0]) / (b[0] - a[0]));
    const values = a.slice(1).map((value, i) => value + (b[i + 1] - value) * mix);
    return { energy: values[0], sphere: values[1], morph: values[2], echo: values[3] };
  }
  function nearestIndex(x, centers) {
    if (!centers.length) return -1;
    let result = 0, distance = Infinity;
    centers.forEach((center, index) => {
      const next = Math.abs(finite(x) - center);
      if (next < distance) { result = index; distance = next; }
    });
    return result;
  }
  function gestureIntent(dx, dy, elapsed = 0) {
    const x = Math.abs(finite(dx)), y = Math.abs(finite(dy));
    if (y > 10 && y > x * 1.15) return "vertical";
    if (x >= DRAG_THRESHOLD && x > y * 1.2) return "dragging";
    return elapsed >= HOLD_MS ? "holding" : "pressed";
  }
  function springStep(position, velocity, target, deltaSeconds) {
    const dt = clamp(deltaSeconds, 0, 1 / 30);
    const nextVelocity = (finite(velocity) + (finite(target) - finite(position)) * 360 * dt) * Math.exp(-28 * dt);
    return { position: finite(position) + nextVelocity * dt, velocity: nextVelocity };
  }
  function shapeGeometry(halfWidth, halfHeight, morph) {
    const amount = clamp(morph, 0, 1), seed = Math.max(8, halfHeight * .40);
    const effectiveHalfWidth = seed + (halfWidth - seed) * amount;
    const effectiveHalfHeight = seed + (halfHeight - seed) * amount;
    const rawCornerRadius = effectiveHalfHeight + (Math.min(halfHeight * .78, 25) - effectiveHalfHeight) * amount;
    return { effectiveHalfWidth, effectiveHalfHeight, rawCornerRadius, effectiveCornerRadius: Math.min(rawCornerRadius, effectiveHalfWidth, effectiveHalfHeight) };
  }
  function captureLossCancels({ samePointer, fromOwner, ownerStillCaptures }) {
    return Boolean(samePointer && fromOwner && !ownerStillCaptures);
  }
  function geometryRect(rect = {}) {
    const w = Math.max(0, finite(rect.w)), h = Math.max(0, finite(rect.h));
    return { x: finite(rect.x), y: finite(rect.y), w, h, r: clamp(finite(rect.r, h / 2), 0, Math.min(w, h) / 2) };
  }
  const math = Object.freeze({ DURATION, DRAG_THRESHOLD, HOLD_MS, clamp, smooth, sampleEnvelope, nearestIndex, gestureIntent, springStep, shapeGeometry, geometry: geometryRect, captureLossCancels });
  global.DramaGlassMath = math;
  if (typeof module !== "undefined" && module.exports) module.exports = math;
  if (!global.document || global.DramaLiquidGlass) return;

  const document = global.document;
  // Adapted from the self-owned UI UX Pro Max V3 glass.js (2026-10-29).
  // Only renderer source is reused; no demo photographs, recordings or atlases.
  function createV3Renderer(output, scene, content) {
/*
 * Scene-backed Liquid Glass renderer. Filled symbols and labels share one
 * optical texture, spatial selection mask and curved-edge sampling field.
 * Geometry uses viewport CSS pixels; time is in seconds. WebGL 1 / GLSL ES 1.00.
 */

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uScene;
uniform sampler2D uIcons;
uniform float uHasIcons;
uniform float uIconRefraction;
uniform float uActivity;
uniform vec3 uSelectedInk;
uniform vec2 uSize;
uniform vec2 uPixels;
uniform vec4 uBar;
uniform vec4 uLens;
uniform vec2 uRadii;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uMotion;
uniform float uReducedTransparency;
uniform float uStrength;
uniform float uAA;
uniform float uOptics;
uniform float uLightPhase;

float roundedBox(vec2 p, vec4 rect, float radius) {
  vec2 halfSize = rect.zw * 0.5;
  vec2 q = abs(p - rect.xy - halfSize) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

// Shape is driven by the parent gesture spring. There is no idle oscillation.
float lensDistance(vec2 p) {
  return roundedBox(p, uLens, uRadii.y);
}

vec2 surfaceNormal(vec2 p, vec4 rect, float radius) {
  const float e = 0.5;
  vec2 n = vec2(
    roundedBox(p + vec2(e, 0.0), rect, radius) -
      roundedBox(p - vec2(e, 0.0), rect, radius),
    roundedBox(p + vec2(0.0, e), rect, radius) -
      roundedBox(p - vec2(0.0, e), rect, radius));
  return n / max(length(n), 0.0001);
}

vec3 scene(vec2 p) {
  return texture2D(uScene, clamp(p / uSize, vec2(0.001), vec2(0.999))).rgb;
}

vec4 iconAt(vec2 p) {
  // One premultiplied texture contains both filled glyphs AND their labels.
  return texture2D(uIcons, clamp(p / uSize, vec2(0.001), vec2(0.999)));
}

float luminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec2 lensSamplePoint(vec2 p, float d, vec2 normal, float power) {
  vec2 center = uLens.xy + uLens.zw * 0.5;
  vec2 local = p - center;
  float interior = 1.0 - smoothstep(-2.0, 0.0, d);
  // A steep curved shoulder bends only the portion crossing the rim. This
  // nonlinear inverse map is deliberately separate from center enlargement.
  float rim = pow(clamp(1.0 + d / 22.0, 0.0, 1.0), 1.55);
  vec2 magnify = -local * 0.072 * interior;
  vec2 shoulder = -normal * 17.0 * rim;
  // Curvature fans the label and symbol contours near the rounded ends.
  // It is tied to surface position, never a time-based wobble.
  vec2 tangent = vec2(-normal.y, normal.x);
  float sideways = local.y / max(uLens.w * 0.5, 1.0);
  vec2 fan = tangent * sideways * abs(normal.x) * rim * 4.2;
  return p + (magnify + shoulder + fan) * power;
}

vec3 refractedScene(vec2 p, vec2 normal, float edge, float power) {
  vec2 dispersion = normal * edge * 0.6 * power;
  vec3 sampleColor = scene(p);
  sampleColor.r = scene(p + dispersion).r;
  sampleColor.b = scene(p - dispersion).b;
  return sampleColor;
}

vec3 barColor(vec2 p, float d, vec2 normal, float ambient) {
  float edge = pow(1.0 - smoothstep(0.0, 10.0, max(-d, 0.0)), 1.45);
  float power = uStrength * (1.0 - uReducedTransparency) * uOptics;
  vec3 color = refractedScene(p - normal * edge * 12.0 * power,
    normal, edge, power);
  vec3 neutral = mix(vec3(0.16, 0.19, 0.23), vec3(0.98),
    smoothstep(0.18, 0.75, ambient));
  color = mix(color, neutral, mix(0.11, 0.97, uReducedTransparency));
  float rim = exp(-abs(d + 0.45) * 2.0);
  float bottom = max(normal.y, 0.0);
  color += vec3(1.0) * rim * (0.13 + max(-normal.y, 0.0) * 0.17);
  color -= vec3(0.035) * edge * bottom;
  return clamp(color, 0.0, 1.0);
}

vec3 selectionColor(vec2 p, float d, vec2 normal, float ambient) {
  float active = clamp(uActivity, 0.0, 1.0);
  float clear = 1.0 - uReducedTransparency;
  float power = active * uStrength * clear * uOptics;
  float edge = pow(clamp(1.0 + d / 18.0, 0.0, 1.0), 1.25);
  vec2 samplePoint = lensSamplePoint(p, d, normal, power * 0.82);
  vec3 color = refractedScene(samplePoint, normal, edge, power);
  float light = smoothstep(0.22, 0.72, ambient);
  vec3 resting = mix(vec3(0.23, 0.26, 0.30), vec3(0.885, 0.89, 0.90), light);
  vec3 litTint = mix(vec3(0.20, 0.24, 0.29), vec3(1.0), light);
  // Rest: a quiet grey selection. Touch: a clearer, elevated optical lens.
  vec3 restColor = mix(color, resting, 0.80);
  vec3 activeColor = mix(color, litTint, 0.09);
  color = mix(restColor, activeColor, active);
  color = mix(color, mix(resting, litTint, active * 0.5),
    uReducedTransparency * 0.97);

  vec2 local = p - uLens.xy - uLens.zw * 0.5;
  float rim = exp(-abs(d + 0.45) * 2.0);
  float innerRim = exp(-abs(d + 1.8) * 1.1);
  vec2 lightDirection = normalize(vec2(sin(uLightPhase) * 0.65, -1.0));
  float upper = max(dot(normal, lightDirection), 0.0);
  float lower = max(-dot(normal, lightDirection), 0.0);
  // Reflections belong to the glass surface, not baked into the glyphs.
  color += vec3(1.0) * rim * active * (0.19 + upper * 0.32);
  color += vec3(0.85, 0.93, 1.0) * innerRim * lower * active * 0.12;
  color -= vec3(0.065, 0.070, 0.075) * edge * active * (0.35 + upper * 0.7);
  float topBevel = exp(-pow((local.y + uLens.w * 0.5 - 7.0) / 4.5, 2.0));
  color -= vec3(0.045) * topBevel * active * clear;
  // Narrow opposing edge hues follow actual surface curvature.
  float chromaRim = exp(-abs(d + 1.2) * 1.2) * abs(normal.x) * active * clear;
  color += vec3(-0.018, 0.022, 0.035) * chromaRim * uStrength;
  return clamp(color, 0.0, 1.0);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x / uPixels.x,
    1.0 - gl_FragCoord.y / uPixels.y) * uSize;
  float dBar = roundedBox(p, uBar, uRadii.x);
  float dLens = lensDistance(p);
  float hasBar = step(0.5, uBar.z);
  float hasLens = step(0.5, uLens.z);
  float barMask = (1.0 - smoothstep(-uAA, uAA, dBar)) * hasBar;
  float lensMask = (1.0 - smoothstep(-uAA, uAA, dLens)) * hasLens;
  float activity = clamp(uActivity, 0.0, 1.0);
  float shadowDistance = roundedBox(p - vec2(0.0, 3.0), uLens, uRadii.y);
  float shadow = exp(-max(shadowDistance, 0.0) / 4.0) *
    (1.0 - lensMask) * hasLens * activity * 0.14;

  // The active lens is an independent surface and may protrude beyond the bar.
  // Avoid clipping it to the base capsule as V2 did.
  if (barMask + lensMask + shadow < 0.001) {
    gl_FragColor = vec4(0.0); return;
  }
  vec2 center = uBar.xy + uBar.zw * 0.5;
  float ambient = luminance((scene(center) +
    scene(center + vec2(uBar.z * 0.29, 0.0)) +
    scene(center - vec2(uBar.z * 0.29, 0.0))) / 3.0);
  vec3 premul = vec3(0.10, 0.13, 0.17) * shadow;
  float alpha = shadow;
  if (barMask > 0.001) {
    vec3 color = barColor(p, dBar, surfaceNormal(p, uBar, uRadii.x), ambient);
    float a = barMask * 0.985;
    premul = color * a + premul * (1.0 - a);
    alpha = a + alpha * (1.0 - a);
  }
  vec2 nLens = surfaceNormal(p, uLens, uRadii.y);
  if (lensMask > 0.001) {
    vec3 color = selectionColor(p, dLens, nLens, ambient);
    float a = lensMask * 0.99;
    premul = color * a + premul * (1.0 - a);
    alpha = a + alpha * (1.0 - a);
  }

  if (uHasIcons > 0.5) {
    vec4 original = iconAt(p);
    float opticalPower = activity * uStrength * uIconRefraction *
      (1.0 - uReducedTransparency) * mix(0.25, 1.0, uMotion) * uOptics;
    vec2 samplePoint = lensSamplePoint(p, dLens, nLens, opticalPower);
    float rim = pow(clamp(1.0 + dLens / 10.0, 0.0, 1.0), 1.65);
    vec2 spectralOffset = nLens * rim * 1.05 * opticalPower;
    float a = iconAt(samplePoint).a;
    vec3 coverage = vec3(iconAt(samplePoint + spectralOffset).a,
      a, iconAt(samplePoint - spectralOffset).a);
    // The selected ink is revealed spatially by the passing glass. A single
    // glyph may therefore be blue inside and retain its original ink outside.
    vec3 glyphCoverage = mix(vec3(original.a), coverage, lensMask);
    vec3 glyphPremul = mix(original.rgb, uSelectedInk * coverage, lensMask);
    premul = glyphPremul + premul * (vec3(1.0) - glyphCoverage);
    float glyphAlpha = max(glyphCoverage.r, max(glyphCoverage.g, glyphCoverage.b));
    alpha = glyphAlpha + alpha * (1.0 - glyphAlpha);
  }
  gl_FragColor = vec4(clamp(premul, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}
`;

const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function parseInk(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return fallback;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

function geometry(rect) {
  const w = Math.max(0, finite(rect?.w, 0));
  const h = Math.max(0, finite(rect?.h, 0));
  return {
    x: finite(rect?.x, 0), y: finite(rect?.y, 0), w, h,
    r: clamp(finite(rect?.r, h * 0.5), 0, Math.min(w, h) * 0.5),
  };
}

class LiquidGlassRenderer {
  constructor(outputCanvas, sourceCanvas, iconCanvas = null) {
    this.canvas = outputCanvas;
    this.sourceCanvas = sourceCanvas;
    this.iconCanvas = iconCanvas;
    this.success = false;
    this.fallback = true;
    this.error = null;
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this._destroyed = false;
    this._lost = false;
    this._previousCenter = null;
    this._lastFrame = 0;
    this._velocity = { x: 0, y: 0 };
    this._onLost = (event) => {
      event.preventDefault();
      this._lost = true;
      this._fail(new Error('WebGL context lost'));
    };
    this._onRestored = () => {
      if (this._destroyed) return;
      this._lost = false;
      this._init();
      this.resize(this.width, this.height, this.dpr);
    };

    try {
      if (!outputCanvas?.getContext || !sourceCanvas || outputCanvas === sourceCanvas) {
        throw new Error('LiquidGlassRenderer requires separate output and source canvases');
      }
      outputCanvas.addEventListener('webglcontextlost', this._onLost, false);
      outputCanvas.addEventListener('webglcontextrestored', this._onRestored, false);
      this._init();
      const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
      this.resize(outputCanvas.clientWidth || sourceCanvas.clientWidth || sourceCanvas.width / dpr,
        outputCanvas.clientHeight || sourceCanvas.clientHeight || sourceCanvas.height / dpr, dpr);
    } catch (error) {
      this._fail(error);
    }
  }

  _fail(error) {
    this.success = false;
    this.fallback = true;
    this.error = error instanceof Error ? error : new Error(String(error));
  }

  _compile(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Could not allocate a WebGL shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  _init() {
    try {
      const attributes = {
        alpha: true, premultipliedAlpha: true, antialias: false,
        depth: false, stencil: false, preserveDrawingBuffer: false,
        powerPreference: 'low-power',
      };
      const gl = this.canvas.getContext('webgl', attributes) ||
        this.canvas.getContext('experimental-webgl', attributes);
      if (!gl) throw new Error('WebGL is unavailable');
      this.gl = gl;
      const vertex = this._compile(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragment = this._compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      const program = gl.createProgram();
      if (!program) throw new Error('Could not allocate a WebGL program');
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program) || 'Shader linking failed';
        gl.deleteProgram(program);
        throw new Error(message);
      }
      this.program = program;
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      this.position = gl.getAttribLocation(program, 'aPosition');
      this.texture = gl.createTexture();
      if (!this.buffer || !this.texture) throw new Error('Could not allocate WebGL resources');
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.iconTexture = gl.createTexture();
      if (!this.iconTexture) throw new Error('Could not allocate the icon texture');
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.iconTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
        gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
      gl.activeTexture(gl.TEXTURE0);
      this.uniforms = {};
      for (const name of ['uScene', 'uSize', 'uPixels', 'uBar', 'uLens', 'uRadii',
        'uPointer', 'uVelocity', 'uMotion', 'uReducedTransparency', 'uStrength', 'uAA',
        'uIcons', 'uHasIcons', 'uIconRefraction', 'uActivity', 'uSelectedInk', 'uOptics', 'uLightPhase']) {
        this.uniforms[name] = gl.getUniformLocation(program, name);
      }
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      this.success = true;
      this.fallback = false;
      this.error = null;
    } catch (error) {
      this._fail(error);
    }
  }

  /** Supply a transparent same-viewport icon canvas, or null to detach it. */
  setIconCanvas(canvas) {
    if (canvas === this.canvas || canvas === this.sourceCanvas) {
      throw new Error('The icon texture must use its own transparent canvas');
    }
    this.iconCanvas = canvas || null;
    return this;
  }

  resize(width, height, dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1) {
    if (this._destroyed || !this.canvas) return false;
    this.width = Math.max(1, finite(width, 1));
    this.height = Math.max(1, finite(height, 1));
    this.dpr = clamp(finite(dpr, 1), 1, 2);
    const pixelWidth = Math.max(1, Math.round(this.width * this.dpr));
    const pixelHeight = Math.max(1, Math.round(this.height * this.dpr));
    if (this.canvas.width !== pixelWidth) this.canvas.width = pixelWidth;
    if (this.canvas.height !== pixelHeight) this.canvas.height = pixelHeight;
    if (this.canvas.style) {
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
    }
    if (this.gl && !this._lost) this.gl.viewport(0, 0, pixelWidth, pixelHeight);
    return this.success;
  }

  /** Returns false if the parent should show its CSS fallback. */
  render({ bar, lens, pointer, time, reducedMotion = false,
    reducedTransparency = false, strength = 1, iconRefraction = 1, press = 0,
    activity = press, ink = '#202124', selectedInk = '#007aff', optics = 1, lightPhase = 0 } = {}) {
    if (this._destroyed || !this.success || this._lost) return false;
    const gl = this.gl;
    try {
      if (gl.isContextLost()) {
        this._lost = true;
        this._fail(new Error('WebGL context lost'));
        return false;
      }
      if (!this.sourceCanvas.width || !this.sourceCanvas.height) return false;
      const b = geometry(bar);
      const l = geometry(lens);
      const now = (typeof performance === 'undefined' ? Date.now() : performance.now()) / 1000;
      const delta = clamp(now - this._lastFrame, 1 / 240, 0.1);
      const center = { x: l.x + l.w * 0.5, y: l.y + l.h * 0.5 };
      const targetX = this._previousCenter ?
        clamp((center.x - this._previousCenter.x) / delta / 1300, -1, 1) : 0;
      const targetY = this._previousCenter ?
        clamp((center.y - this._previousCenter.y) / delta / 1300, -1, 1) : 0;
      const smoothing = 1 - Math.exp(-delta * 18);
      this._velocity.x += (targetX - this._velocity.x) * smoothing;
      this._velocity.y += (targetY - this._velocity.y) * smoothing;
      this._previousCenter = center;
      this._lastFrame = now;

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.enableVertexAttribArray(this.position);
      gl.vertexAttribPointer(this.position, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceCanvas);
      const hasIcons = !!(this.iconCanvas?.width && this.iconCanvas?.height);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.iconTexture);
      if (hasIcons) {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.iconCanvas);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      }

      const u = this.uniforms;
      gl.uniform1i(u.uScene, 0);
      gl.uniform1i(u.uIcons, 1);
      gl.uniform1f(u.uHasIcons, hasIcons ? 1 : 0);
      gl.uniform1f(u.uIconRefraction, clamp(finite(iconRefraction, 1), 0, 2));
      gl.uniform1f(u.uActivity, clamp(finite(activity, 0), 0, 1));
      gl.uniform1f(u.uOptics, optics ? 1 : 0);
      gl.uniform1f(u.uLightPhase, finite(lightPhase, 0));
      const selectedColor = parseInk(selectedInk, [0, 122 / 255, 1]);
      gl.uniform3f(u.uSelectedInk, ...selectedColor);
      gl.uniform2f(u.uSize, this.width, this.height);
      gl.uniform2f(u.uPixels, this.canvas.width, this.canvas.height);
      gl.uniform4f(u.uBar, b.x, b.y, b.w, b.h);
      gl.uniform4f(u.uLens, l.x, l.y, l.w, l.h);
      gl.uniform2f(u.uRadii, b.r, l.r);
      gl.uniform2f(u.uPointer, finite(pointer?.x, -10000), finite(pointer?.y, -10000));
      gl.uniform2f(u.uVelocity, this._velocity.x, this._velocity.y);
      gl.uniform1f(u.uMotion, reducedMotion ? 0 : 1);
      gl.uniform1f(u.uReducedTransparency, reducedTransparency ? 1 : 0);
      gl.uniform1f(u.uStrength, clamp(finite(strength, 1), 0, 2));
      gl.uniform1f(u.uAA, Math.max(0.55, 0.95 / this.dpr));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    } catch (error) {
      // Includes a tainted source canvas: keep the DOM fallback usable.
      this._fail(error);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return false;
    }
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.canvas?.removeEventListener('webglcontextlost', this._onLost, false);
    this.canvas?.removeEventListener('webglcontextrestored', this._onRestored, false);
    if (this.gl && !this._lost) {
      this.gl.deleteTexture(this.texture);
      this.gl.deleteTexture(this.iconTexture);
      this.gl.deleteBuffer(this.buffer);
      this.gl.deleteProgram(this.program);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    this.success = false;
    this.fallback = true;
    this._previousCenter = null;
    this.iconCanvas = null;
  }
}

    return new LiquidGlassRenderer(output, scene, content);
  }

  const selectors = "nav.bottom-nav[data-liquid-nav]";
  const allowedActions = Object.freeze(["go-home", "open-run", "open-settings"]);
  const buttonSelector = selectors + " > button:is(" + allowedActions.map(action => '[data-action="' + action + '"]').join(",") + ")";
  const canvas = document.createElement("canvas");
  const sceneCanvas = document.createElement("canvas");
  const contentCanvas = document.createElement("canvas");
  const sceneContext = sceneCanvas.getContext("2d");
  const contentContext = contentCanvas.getContext("2d");
  canvas.className = "liquid-glass-canvas";
  canvas.setAttribute("aria-hidden", "true"); canvas.setAttribute("role", "presentation");
  const indicator = document.createElement("span");
  indicator.className = "liquid-glass-indicator"; indicator.setAttribute("aria-hidden", "true");
  let renderer = createV3Renderer(canvas, sceneCanvas, contentCanvas);
  let nav = null, buttons = [], geometry = null, resizeObserver = null;
  let raf = 0, previousFrame = 0, currentX = null, targetX = 0, velocity = 0;
  let pulseStart = -Infinity, pulseSerial = 0, gesture = null, previewIndex = -1;
  let suppression = null, internalClick = false, destroyed = false;
  let lastFrame = null, lastCancelReason = null, lastOutcome = "idle";
  let activeIndex = 0, commitCount = 0, cancelCount = 0, previewCount = 0, lastCommittedIndex = null;
  let lastCommitAt = -Infinity, mode = "fallback", activity = 0, activityVelocity = 0, tapUntil = 0;
  let glyphs = [], contentReady = false, contentFallbackReason = null;
  let rasterSignature = "", rasterActiveIndex = -1, lastPointerType = null;
  let ignoredCaptureLosses = 0, captureAcquiredCount = 0, captureLostCount = 0;
  const renderStats = { mounts: 0, measurements: 0, contentRasters: 0, drawFrames: 0 };
  const defaultTest = () => ({ freeze: false, elapsed: .35, optics: true, lightOffset: 0, forceFallback: false, activity: null, lensX: null, iconRefraction: 1, scene: "theme" });
  const test = defaultTest();
  const reducedMotion = global.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedTransparency = global.matchMedia("(prefers-reduced-transparency: reduce)");
  const moreContrast = global.matchMedia("(prefers-contrast: more)");
  const forcedColors = global.matchMedia("(forced-colors: active)");
  const clippingSupported = Boolean(global.CSS?.supports?.("clip-path", "inset(0px round 16px)"));
  const listeners = [];
  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options); listeners.push([target, type, callback, options]);
  }
  const now = () => global.performance.now();
  function preferredMode() {
    if (forcedColors.matches || moreContrast.matches) return "high-contrast";
    if (reducedTransparency.matches) return "reduced-transparency";
    if (reducedMotion.matches) return "reduced-motion";
    return renderer?.success && contentReady && clippingSupported && !test.forceFallback ? "webgl" : "fallback";
  }
  function setMode(next) {
    mode = next;
    if (nav) {
      nav.dataset.liquidMode = mode;
      // DOM content is hidden ONLY after a successful frame of its replacement.
      if (mode !== "webgl") delete nav.dataset.liquidContent;
    }
  }
  function palette() {
    const style = global.getComputedStyle(document.documentElement);
    const velvet = document.documentElement.dataset.theme === "velvet";
    return {
      cream: style.getPropertyValue("--cream").trim() || (velvet ? "#fbf3ec" : "#f5f8f6"),
      ink: style.getPropertyValue("--plum").trim() || (velvet ? "#452b3d" : "#22352e"),
      selectedInk: style.getPropertyValue("--rose").trim() || (velvet ? "#a73558" : "#216b51")
    };
  }
  function indexFromDOM() {
    const selected = buttons.findIndex(button => button.getAttribute("aria-current") === "page" || button.classList.contains("active"));
    return selected >= 0 ? selected : Math.trunc(clamp(Number(nav?.dataset.activeIndex), 0, buttons.length - 1));
  }
  function stop() { if (raf) global.cancelAnimationFrame(raf); raf = 0; previousFrame = 0; }
  function requestFrame() {
    if (destroyed || raf || !nav?.isConnected || document.hidden) return;
    raf = global.requestAnimationFrame(draw);
  }
  const normalizeRect = geometryRect;
  function placeIndicator(cell, x) {
    const halfWidth = Math.max(24, cell.width / 2 - 2.5), halfHeight = Math.max(24, (geometry.bar.h - 10) / 2);
    indicator.style.setProperty("--glass-x", (x - halfWidth) + "px");
    indicator.style.setProperty("--glass-y", (cell.y - halfHeight) + "px");
    indicator.style.setProperty("--glass-width", (halfWidth * 2) + "px");
    indicator.style.setProperty("--glass-height", (halfHeight * 2) + "px");
    indicator.style.setProperty("--glass-radius", halfHeight + "px");
    return { halfWidth, halfHeight };
  }
  function resizeSource(source, context) {
    const width = Math.round(geometry.width * geometry.dpr), height = Math.round(geometry.height * geometry.dpr);
    if (source.width !== width) source.width = width;
    if (source.height !== height) source.height = height;
    context.setTransform(geometry.dpr, 0, 0, geometry.dpr, 0, 0);
    context.clearRect(0, 0, geometry.width, geometry.height);
  }
  function drawScene() {
    if (!sceneContext) return false;
    resizeSource(sceneCanvas, sceneContext);
    // Reconstruct ONLY our known theme-colored navigation neighborhood. This is
    // not an HTML screenshot, nor a claim to refract arbitrary page imagery.
    const ctx = sceneContext, colors = palette();
    ctx.fillStyle = colors.cream; ctx.fillRect(0, 0, geometry.width, geometry.height);
    if (test.scene === "calibration") {
      ctx.fillStyle = "#fafafa"; ctx.fillRect(0, 0, geometry.width, geometry.height);
      ctx.strokeStyle = "#8a969e"; ctx.lineWidth = 1;
      for (let x = 0; x < geometry.width; x += 14) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, geometry.height); ctx.stroke();
      }
      ctx.fillStyle = "#b7d1d9"; ctx.fillRect(geometry.width * .35, 0, 9, geometry.height);
    }
    return true;
  }
  function localRect(rect) {
    return { x: rect.left - geometry.rect.left - geometry.borderLeft + PAD_X,
      y: rect.top - geometry.rect.top - geometry.borderTop + PAD_Y, w: rect.width, h: rect.height };
  }
  function drawSymbol(svg, ink) {
    const ctx = contentContext, rect = localRect(svg.getBoundingClientRect());
    const viewBox = svg.viewBox?.baseVal;
    if (!viewBox?.width || !rect.w || !rect.h) throw new Error("Missing navigation icon geometry");
    ctx.save(); ctx.translate(rect.x, rect.y); ctx.scale(rect.w / viewBox.width, rect.h / viewBox.height); ctx.translate(-viewBox.x, -viewBox.y);
    ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = "round"; ctx.lineJoin = "round";
    // Reuse the actual product's coherent SVG family, not the unrelated demo
    // glyphs. Never blindly fill an open run-chart or gear outline.
    for (const element of svg.querySelectorAll("path,circle,rect,line,polyline,polygon")) {
      const computed = global.getComputedStyle(element);
      ctx.lineWidth = parseFloat(computed.strokeWidth) || 1.8;
      let path;
      if (element.tagName.toLowerCase() === "path") path = new Path2D(element.getAttribute("d") || "");
      else {
        path = new Path2D(); const get = name => parseFloat(element.getAttribute(name)) || 0;
        switch (element.tagName.toLowerCase()) {
          case "circle": path.arc(get("cx"), get("cy"), get("r"), 0, Math.PI * 2); break;
          case "rect": path.rect(get("x"), get("y"), get("width"), get("height")); break;
          case "line": path.moveTo(get("x1"), get("y1")); path.lineTo(get("x2"), get("y2")); break;
          default: {
            const points = (element.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number);
            for (let i = 0; i < points.length - 1; i += 2) i ? path.lineTo(points[i], points[i + 1]) : path.moveTo(points[i], points[i + 1]);
            if (element.tagName.toLowerCase() === "polygon") path.closePath();
          }
        }
      }
      if (computed.fill !== "none") ctx.fill(path, element.getAttribute("fill-rule") || "nonzero");
      if (computed.stroke !== "none") ctx.stroke(path);
    }
    ctx.restore(); return rect;
  }
  function drawLabel(span, ink) {
    const ctx = contentContext, style = global.getComputedStyle(span), fontSize = parseFloat(style.fontSize);
    ctx.font = style.fontStyle + " " + style.fontWeight + " " + fontSize + "px " + style.fontFamily;
    ctx.fillStyle = ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    const lines = [], walker = document.createTreeWalker(span, global.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      let offset = 0;
      for (const character of node.textContent) {
        const range = document.createRange(); range.setStart(node, offset); offset += character.length; range.setEnd(node, offset);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        let line = lines.find(value => Math.abs(value.top - rect.top) < 1.5);
        if (!line) { line = { text: "", left: rect.left, top: rect.top, height: rect.height, right: rect.right }; lines.push(line); }
        line.text += character; line.right = Math.max(line.right, rect.right);
      }
    }
    const metrics = ctx.measureText("Mg"), ascent = metrics.fontBoundingBoxAscent || fontSize * .8, descent = metrics.fontBoundingBoxDescent || fontSize * .2;
    return lines.map(line => {
      const bounds = localRect({ left: line.left, top: line.top, width: line.right - line.left, height: line.height });
      const baseline = bounds.y + (bounds.h - ascent - descent) / 2 + ascent;
      ctx.fillText(line.text, bounds.x, baseline);
      return { text: line.text, bounds, baseline, fontSize, lineHeight: parseFloat(style.lineHeight) || fontSize * 1.35 };
    });
  }
  function drawContent() {
    renderStats.contentRasters++;
    contentReady = false; contentFallbackReason = null; glyphs = [];
    if (!contentContext || !sceneContext || !global.Path2D) { contentFallbackReason = "canvas-content-unavailable"; return; }
    try {
      resizeSource(contentCanvas, contentContext);
      contentContext.globalCompositeOperation = "source-over";
      contentContext.globalAlpha = 1;
      const ink = palette().ink;
      for (const [index, button] of buttons.entries()) {
        const svg = button.querySelector("svg"), label = button.querySelector("span");
        if (!svg || !label) throw new Error("Missing icon or label");
        const iconBounds = drawSymbol(svg, ink), labelLines = drawLabel(label, ink);
        glyphs.push({ index, label: label.textContent.trim(), iconBounds, labelBounds: localRect(label.getBoundingClientRect()), labelLines });
        if (labelLines.length !== 1) contentFallbackReason = "wrapped-label-accessibility-dom";
        const bounds = [iconBounds, ...labelLines.map(line => line.bounds)];
        if (bounds.some(rect => rect.x < 0 || rect.y < 0 || rect.x + rect.w > geometry.width || rect.y + rect.h > geometry.height)) contentFallbackReason = "content-outside-local-optical-bounds";
      }
      contentReady = !contentFallbackReason && glyphs.length === 3 && drawScene();
      rasterActiveIndex = activeIndex;
    } catch (_) { contentFallbackReason = "content-rasterization-failed"; }
  }
  function measure(options = {}) {
    if (!nav?.isConnected || !buttons.length) { geometry = null; return; }
    renderStats.measurements++;
    const box = nav.getBoundingClientRect(); if (!box.width || !box.height) return;
    const style = global.getComputedStyle(nav);
    const borderLeft = parseFloat(style.borderLeftWidth) || 0, borderTop = parseFloat(style.borderTopWidth) || 0;
    const width = box.width - borderLeft - (parseFloat(style.borderRightWidth) || 0);
    const height = box.height - borderTop - (parseFloat(style.borderBottomWidth) || 0);
    const cells = buttons.map(button => {
      const r = button.getBoundingClientRect();
      return { x: r.left - box.left - borderLeft + r.width / 2, y: r.top - box.top - borderTop + r.height / 2, width: r.width, height: r.height };
    });
    geometry = { rect: box, borderLeft, borderTop, width: width + PAD_X * 2, height: height + PAD_Y * 2, cells,
      centers: cells.map(cell => cell.x), dpr: clamp(global.devicePixelRatio || 1, 1, 2),
      bar: normalizeRect({ x: PAD_X, y: PAD_Y, w: width, h: height, r: parseFloat(style.borderRadius) || height / 2 }) };
    renderer.resize(geometry.width, geometry.height, geometry.dpr);
    canvas.style.width = geometry.width + "px"; canvas.style.height = geometry.height + "px";
    const signature = [geometry.width, geometry.height, geometry.dpr, activeIndex, palette().ink, test.scene,
      ...cells.flatMap(cell => [cell.x, cell.y, cell.width, cell.height]),
      ...buttons.map(button => {
        const label = button.querySelector("span"), font = label && global.getComputedStyle(label);
        return [label?.textContent, font?.fontSize, font?.fontWeight, font?.fontFamily, font?.lineHeight, button.querySelector("svg")?.innerHTML].join("|");
      })].join(";");
    if (signature !== rasterSignature || options.forceContent === true) {
      drawContent(); rasterSignature = signature;
    }
    if (!gesture) targetX = cells[activeIndex]?.x || cells[0].x;
    if (test.freeze && Number.isFinite(test.lensX)) targetX = clamp(test.lensX, geometry.centers[0], geometry.centers[2]);
    setMode(preferredMode());
    const snap = mode !== "webgl" || test.freeze || !gesture && now() > tapUntil && activity < .002;
    if (currentX === null || Math.abs(currentX - targetX) > box.width || snap) { currentX = targetX; velocity = 0; }
    placeIndicator(cells[activeIndex] || cells[0], currentX);
    // First static frame is synchronous; do not leave a previous route's pill.
    if (snap || options.synchronous === true) { stop(); draw(now()); } else requestFrame();
  }
  function updatePreview(index) {
    if (index === previewIndex) return;
    previewIndex = index; previewCount++;
    buttons.forEach((button, i) => button.classList.toggle("glass-preview", gesture?.phase === "dragging" && i === index));
    if (nav) nav.dataset.liquidPreview = String(index);
  }
  function pulse() { pulseStart = now(); pulseSerial++; requestFrame(); }
  function clearInspection() { test.freeze = false; test.activity = null; test.lensX = null; }
  function settleToSelected(snap = false) {
    tapUntil = 0; clearInspection();
    targetX = geometry?.cells[activeIndex]?.x || targetX;
    if (snap) { currentX = targetX; velocity = 0; activity = 0; activityVelocity = 0; }
  }
  function draw(timestamp) {
    raf = 0;
    if (!nav?.isConnected || !geometry || document.hidden) { previousFrame = 0; return; }
    renderStats.drawFrames++;
    setMode(preferredMode());
    if (gesture && gesture.phase !== "dragging" && timestamp - gesture.started >= HOLD_MS) gesture.phase = "holding";
    const delta = previousFrame ? clamp((timestamp - previousFrame) / 1000, 0, .032) : 1 / 60;
    previousFrame = timestamp;
    const targetActivity = gesture || timestamp < tapUntil ? 1 : 0;
    if (test.freeze) {
      currentX = Number.isFinite(test.lensX) ? clamp(test.lensX, geometry.centers[0], geometry.centers[2]) : targetX;
      velocity = 0; activity = test.activity === null ? sampleEnvelope(test.elapsed).energy : test.activity; activityVelocity = 0;
    } else if (mode !== "webgl") { currentX = targetX; velocity = 0; activity = 0; activityVelocity = 0; }
    else {
      velocity += (targetX - currentX) * 650 * delta; velocity *= Math.exp(-29 * delta); currentX += velocity * delta;
      activityVelocity += (targetActivity - activity) * 520 * delta; activityVelocity *= Math.exp(-29 * delta); activity += activityVelocity * delta;
      activity = clamp(activity, 0, 1);
    }
    if (Math.abs(currentX - targetX) < .025 && Math.abs(velocity) < .08) { currentX = targetX; velocity = 0; }
    if (Math.abs(activity - targetActivity) < .001 && Math.abs(activityVelocity) < .01 && !test.freeze) { activity = targetActivity; activityVelocity = 0; }
    const cell = geometry.cells[gesture?.phase === "dragging" ? previewIndex : activeIndex] || geometry.cells[0];
    const resting = placeIndicator(cell, currentX), active = mode === "webgl" ? activity : 0;
    const stretch = Math.min(9, Math.abs(velocity) * .012) * active;
    const lensWidth = resting.halfWidth * 2 + active * Math.min(35, cell.width * .34) + stretch;
    const lensHeight = resting.halfHeight * 2 + active * 25 - stretch * .15;
    const lens = normalizeRect({ x: currentX + PAD_X - lensWidth / 2, y: cell.y + PAD_Y - lensHeight / 2, w: lensWidth, h: lensHeight, r: lensHeight / 2 });
    const colors = palette();
    lastFrame = { lens, bar: geometry.bar, activity: active, x: currentX + PAD_X, y: cell.y + PAD_Y,
      halfWidth: lens.w / 2, halfHeight: lens.h / 2, energy: active, sphere: 0, morph: 1, echo: 0,
      time: test.freeze ? test.elapsed : Math.max(0, timestamp - pulseStart) / 1000, lightOffset: test.lightOffset,
      iconRefraction: test.iconRefraction, pointer: gesture ? { x: gesture.x - geometry.rect.left + PAD_X, y: gesture.y - geometry.rect.top + PAD_Y } : null };
    if (mode === "webgl") {
      const rendered = renderer.render({ bar: geometry.bar, lens, pointer: lastFrame.pointer, time: timestamp / 1000,
        activity: active, strength: .75, selectedInk: colors.selectedInk, iconRefraction: test.iconRefraction,
        optics: test.optics, lightPhase: active * .5 + (currentX - targetX) * .015 + test.lightOffset });
      if (rendered) nav.dataset.liquidContent = "ready";
      else setMode("fallback");
    }
    const moving = Math.abs(currentX - targetX) > .025 || Math.abs(velocity) > .08 || Math.abs(activity - targetActivity) > .001 || Math.abs(activityVelocity) > .01;
    if (!test.freeze && mode === "webgl" && (moving || timestamp < tapUntil)) requestFrame(); else previousFrame = 0;
  }
  function releaseCapture(record) {
    try {
      const owner = record?.captureElement;
      if (owner?.hasPointerCapture(record.pointerId)) owner.releasePointerCapture(record.pointerId);
    } catch (_) { /* Detached route is safe. */ }
  }
  function suppressCompatibilityClick(record) {
    suppression = { pointerId: record.pointerId, pointerType: record.pointerType, x: record.x, y: record.y, until: now() + 700 };
  }
  function clearGesture() {
    const record = gesture; gesture = null; releaseCapture(record);
    if (nav) delete nav.dataset.liquidDragging;
    buttons.forEach(button => button.classList.remove("glass-preview"));
    previewIndex = -1; if (nav) delete nav.dataset.liquidPreview;
    return record;
  }
  function cancelGesture(reason) {
    if (!gesture) return;
    const record = clearGesture(); suppressCompatibilityClick(record);
    cancelCount++; lastCancelReason = reason; lastOutcome = "cancelled";
    settleToSelected();
    requestFrame();
  }
  function reconcile(force = false) {
    if (destroyed) return;
    const next = document.querySelector(selectors);
    if (next === nav) {
      if (nav) {
        activeIndex = indexFromDOM();
        if (force === true || rasterActiveIndex !== activeIndex) measure({ synchronous: true, forceContent: force === true });
      }
      return;
    }
    if (gesture) cancelGesture("route-replaced");
    resizeObserver?.disconnect(); nav = next; buttons = [];
    if (!nav) { canvas.remove(); indicator.remove(); geometry = null; activity = 0; activityVelocity = 0; tapUntil = 0; stop(); return; }
    buttons = [...nav.querySelectorAll(":scope > button")].filter(button => allowedActions.includes(button.dataset.action));
    if (buttons.length !== 3) { nav = null; geometry = null; stop(); return; }
    activeIndex = indexFromDOM(); nav.classList.add("liquid-enhanced");
    renderStats.mounts++; rasterSignature = "";
    nav.prepend(indicator); nav.insertBefore(canvas, indicator.nextSibling);
    if (global.ResizeObserver) { resizeObserver = new global.ResizeObserver(measure); resizeObserver.observe(nav); }
    // A newly attached canvas and its DOM replacement must become visible in
    // the same task, never one frame of old pixels plus duplicate new labels.
    measure({ synchronous: true, forceContent: true });
  }
  function onPointerDown(event) {
    if (event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) return;
    const button = event.target.closest?.(buttonSelector);
    if (!button || button.disabled) return;
    if (gesture) cancelGesture("new-pointer");
    clearInspection(); tapUntil = 0;
    suppression = null; reconcile();
    const index = buttons.indexOf(button); if (index < 0 || !geometry) return;
    lastPointerType = event.pointerType || "unknown";
    gesture = { pointerId: event.pointerId, pointerType: lastPointerType, captureElement: button, nav, index, started: now(), startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, phase: "pressed" };
    try { button.setPointerCapture(event.pointerId); } catch (_) { /* Document listeners remain available if capture is unsupported. */ }
    targetX = geometry.cells[index].x; updatePreview(index); lastOutcome = "pressed"; pulse();
    // Touch already implicitly captures the pressed button. Keep that SAME
    // owner throughout the gesture; moving capture to nav would emit a lost
    // event from the old button and formerly cancelled every real touch drag.
    // Capturing the button also preserves the ordinary tap's native click.
  }
  function onPointerMove(event) {
    if (!gesture || event.pointerId !== gesture.pointerId || !geometry) return;
    gesture.x = event.clientX; gesture.y = event.clientY;
    const dx = event.clientX - gesture.startX, dy = event.clientY - gesture.startY;
    const intent = gestureIntent(dx, dy, now() - gesture.started);
    const rect = geometry.rect;
    if (intent === "vertical") { cancelGesture("vertical-intent"); return; }
    if (event.clientY < rect.top - 28 || event.clientY > rect.bottom + 28 || event.clientX < rect.left - 28 || event.clientX > rect.right + 28) { cancelGesture("outside-dock"); return; }
    if (intent === "dragging" || gesture.phase === "dragging") {
      if (gesture.phase !== "dragging") {
        gesture.phase = "dragging"; nav.dataset.liquidDragging = "true";
        try { gesture.captureElement.setPointerCapture(event.pointerId); } catch (_) { /* Document listeners still observe cancellation. */ }
      }
      targetX = clamp(event.clientX - rect.left - geometry.borderLeft, geometry.centers[0], geometry.centers[geometry.centers.length - 1]);
      updatePreview(nearestIndex(targetX, geometry.centers)); requestFrame();
    } else gesture.phase = intent;
  }
  function onPointerUp(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    gesture.x = event.clientX; gesture.y = event.clientY;
    const rect = geometry?.rect;
    if (rect && (event.clientY < rect.top - 28 || event.clientY > rect.bottom + 28 || event.clientX < rect.left - 28 || event.clientX > rect.right + 28)) {
      cancelGesture("outside-dock"); return;
    }
    if (gesture.phase === "dragging") {
      const index = previewIndex, button = buttons[index], record = clearGesture();
      suppressCompatibilityClick(record);
      if (button?.isConnected && !button.disabled) {
        internalClick = true;
        try { button.click(); } finally { internalClick = false; }
      } else { targetX = geometry?.cells[activeIndex]?.x || targetX; requestFrame(); }
    } else {
      clearGesture(); tapUntil = now() + 170; requestFrame();
      const serial = pulseSerial, releasedAt = now();
      global.setTimeout(() => {
        if (serial === pulseSerial && lastCommitAt < releasedAt && !gesture) { settleToSelected(); requestFrame(); }
      }, 100);
    }
  }
  function onClick(event) {
    const pointerClick = event.detail > 0 || event.pointerType === "touch" || event.pointerType === "pen" || event.sourceCapabilities?.firesTouchEvents;
    const sameReleasedPointer = suppression && Number.isFinite(event.pointerId) && event.pointerId > 0 && event.pointerId === suppression.pointerId;
    const atRelease = suppression && Math.abs(event.clientX - suppression.x) < 18 && Math.abs(event.clientY - suppression.y) < 18;
    if (suppression && event.isTrusted && pointerClick && now() <= suppression.until && (sameReleasedPointer || atRelease)) {
      suppression = null; event.preventDefault(); event.stopImmediatePropagation(); return;
    }
    const button = event.target.closest?.(buttonSelector);
    if (!button || button.disabled) return;
    if (button.closest(selectors) !== nav) reconcile();
    const index = buttons.indexOf(button); if (index < 0) return;
    if (gesture) clearGesture();
    clearInspection(); tapUntil = !internalClick && pointerClick ? now() + 170 : 0;
    lastCommittedIndex = index; commitCount++; lastCommitAt = now();
    lastOutcome = internalClick ? "drag-committed" : pointerClick ? "tap-committed" : "keyboard-or-programmatic-committed";
    targetX = geometry?.cells[index]?.x || targetX; activeIndex = index; pulse();
    // The existing delegated click listener performs the route change immediately.
  }
  function preferenceChanged() { if (gesture) cancelGesture("preference-changed"); settleToSelected(true); stop(); measure(); }
  function onLostPointerCapture(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const owner = gesture.captureElement;
    let ownerStillCaptures = false;
    try { ownerStillCaptures = owner.hasPointerCapture(event.pointerId); } catch (_) { /* An actual detached owner cannot retain capture. */ }
    if (captureLossCancels({ samePointer: true, fromOwner: event.target === owner, ownerStillCaptures })) {
      captureLostCount++; cancelGesture("lostpointercapture");
    } else ignoredCaptureLosses++;
  }

  listen(document, "pointerdown", onPointerDown, true);
  listen(document, "pointermove", onPointerMove, true);
  listen(document, "pointerup", onPointerUp, true);
  listen(document, "pointercancel", event => { if (gesture?.pointerId === event.pointerId) cancelGesture("pointercancel"); }, true);
  listen(document, "gotpointercapture", event => { if (gesture?.pointerId === event.pointerId && event.target === gesture.captureElement) captureAcquiredCount++; }, true);
  listen(document, "lostpointercapture", onLostPointerCapture, true);
  listen(document, "click", onClick, true);
  listen(document, "contextmenu", event => { if (gesture && now() - gesture.started >= HOLD_MS) event.preventDefault(); }, true);
  listen(document, "keydown", event => { if (event.key === "Escape" && gesture) { cancelGesture("escape"); event.preventDefault(); } }, true);
  listen(global, "blur", () => { cancelGesture("window-blur"); settleToSelected(true); stop(); measure(); });
  listen(global, "resize", measure);
  listen(document, "visibilitychange", () => { if (document.hidden) { cancelGesture("document-hidden"); settleToSelected(true); stop(); } else { settleToSelected(true); reconcile(); } });
  listen(document, "drama-screen-rendered", reconcile);
  listen(canvas, "webglcontextlost", event => { event.preventDefault(); cancelGesture("context-lost"); settleToSelected(true); setMode("fallback"); stop(); requestFrame(); });
  listen(canvas, "webglcontextrestored", () => { settleToSelected(true); measure(); });
  [reducedMotion, reducedTransparency, moreContrast, forcedColors].forEach(media => {
    if (media.addEventListener) listen(media, "change", preferenceChanged);
    else { media.addListener(preferenceChanged); listeners.push([media, "legacy-media", preferenceChanged]); }
  });
  const observer = new global.MutationObserver(records => {
    const affectsNavigation = records.some(record => {
      const nodes = [...record.addedNodes, ...record.removedNodes].filter(node => node !== canvas && node !== indicator);
      if (!nodes.length) return false;
      if (nav?.contains(record.target)) return true;
      return nodes.some(node => node === nav || node.nodeType === 1 && (node.matches?.(selectors) || node.querySelector?.(selectors)));
    });
    // Clock/status/body text changes must not rasterize an unchanged dock.
    if (affectsNavigation) reconcile(true);
  });
  observer.observe(document.getElementById("phone") || document.body, { childList: true, subtree: true });
  const themeObserver = new global.MutationObserver(measure);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  global.DramaLiquidGlass = Object.freeze({
    mount: () => reconcile(true), refresh: () => reconcile(true),
    diagnostics() {
      const colors = nav ? palette() : { ink: null, selectedInk: null };
      const screenRect = rect => geometry ? {
        x: geometry.rect.left + geometry.borderLeft + rect.x - PAD_X,
        y: geometry.rect.top + geometry.borderTop + rect.y - PAD_Y,
        width: rect.w, height: rect.h,
        right: geometry.rect.left + geometry.borderLeft + rect.x - PAD_X + rect.w,
        bottom: geometry.rect.top + geometry.borderTop + rect.y - PAD_Y + rect.h
      } : null;
      return {
        version: "7.2.0", reference: "ui-ux-pro-max/liquid-glass-tab-v3", mode, running: Boolean(raf),
        gestureState: gesture ? (gesture.phase === "pressed" && now() - gesture.started >= HOLD_MS ? "holding" : gesture.phase) : "idle",
        activeIndex: nav ? activeIndex : null, selectedTab: nav ? activeIndex : null,
        previewIndex: previewIndex < 0 ? null : previewIndex, previewTab: previewIndex < 0 ? activeIndex : previewIndex,
        currentX, targetX, activity: lastFrame?.activity || 0,
        captureOwnerAction: gesture?.captureElement?.dataset.action || null,
        pointerCapture: { strategy: "stable-origin-button", lastPointerType, captureAcquiredCount, captureLostCount, ignoredCaptureLosses },
        renderStats: { ...renderStats },
        lastCommittedIndex, commitCount, cancelCount, previewCount, lastCancelReason, lastOutcome,
        ink: colors.ink, selectedInk: colors.selectedInk,
        contentRefraction: mode === "webgl" && contentReady && test.iconRefraction > 0 && test.optics,
        contentFallbackReason, scene: test.scene === "calibration" ? "generated-calibration-grid" : "theme-local-surface-reconstruction",
        scope: { selector: buttonSelector, allowedActions: [...allowedActions], targetCount: buttons.length,
          canvasBoundedToDock: true, dockDefinition: "navigation plus local optical padding only",
          opticalPadding: { x: PAD_X, y: PAD_Y }, allowsLensProtrusionBeyondBar: true,
          interactiveEffectsOutsideDock: false, clippingSupported,
          attachedCanvasCount: document.querySelectorAll(selectors + " > .liquid-glass-canvas").length },
        textureInfo: { sceneAndContentSeparate: true, iconAndLabelShareTexture: true,
          sceneWidth: sceneCanvas.width, sceneHeight: sceneCanvas.height, contentWidth: contentCanvas.width, contentHeight: contentCanvas.height,
          contentReady, domVisualsHidden: nav?.dataset.liquidContent === "ready", premultipliedContentAlpha: true, externalImages: 0 },
        glyphs: glyphs.map(glyph => ({ ...glyph, iconScreenBounds: screenRect(glyph.iconBounds),
          labelScreenBounds: screenRect(glyph.labelBounds),
          labelLines: glyph.labelLines.map(line => ({ ...line, screenBounds: screenRect(line.bounds) })) })),
        bar: lastFrame ? { ...lastFrame.bar, screenRect: screenRect(lastFrame.bar) } : null,
        lens: lastFrame ? { ...lastFrame.lens, screenRect: screenRect(lastFrame.lens) } : null,
        localOpticalBounds: geometry ? screenRect({ x: 0, y: 0, w: geometry.width, h: geometry.height }) : null,
        renderer: { shader: "v3-scene-content-nonlinear-refraction", hasExternalTextures: false,
          backdrop: "controlled-theme-neighborhood-not-arbitrary-dom-screenshot", opticsEnabled: test.optics,
          iconRefraction: test.iconRefraction, success: Boolean(renderer?.success), contextLost: Boolean(renderer?._lost),
          error: renderer?.error ? "renderer-unavailable" : null,
          canvasWidth: canvas.width, canvasHeight: canvas.height, dprCap: 2,
          geometry: lastFrame ? { centerX: lastFrame.x, centerY: lastFrame.y, halfWidth: lastFrame.halfWidth, halfHeight: lastFrame.halfHeight,
            cornerRadius: lastFrame.lens.r, effectiveHalfWidth: lastFrame.halfWidth, effectiveHalfHeight: lastFrame.halfHeight,
            effectiveCornerRadius: lastFrame.lens.r, rawCornerRadius: lastFrame.lens.r } : null,
          parameters: lastFrame ? { energy: lastFrame.energy, sphere: 0, morph: 1, echo: 0, activity: lastFrame.activity,
            time: lastFrame.time, lightOffset: test.lightOffset, iconRefraction: test.iconRefraction } : null },
        test: { frozen: test.freeze, forcedFallback: test.forceFallback, activity: test.activity, lensX: test.lensX }
      };
    },
    // Material-only inspection controls; never reads or changes alarm state.
    // elapsed keeps deterministic legacy fixtures. V3 uses activity, not the old
    // 1.413-second circle animation, for real pointer feedback.
    configureForTest(options = {}) {
      if (options.reset) Object.assign(test, defaultTest());
      else {
        if (typeof options.freeze === "boolean") test.freeze = options.freeze;
        if (Number.isFinite(options.elapsed)) test.elapsed = clamp(options.elapsed, 0, DURATION);
        if (typeof options.optics === "boolean") test.optics = options.optics;
        if (Number.isFinite(options.lightOffset)) test.lightOffset = options.lightOffset;
        if (typeof options.forceFallback === "boolean") test.forceFallback = options.forceFallback;
        if (Number.isFinite(options.activity)) test.activity = clamp(options.activity, 0, 1);
        if (options.activity === null) test.activity = null;
        if (Number.isFinite(options.lensX)) test.lensX = options.lensX;
        if (options.lensX === null) test.lensX = null;
        if (Number.isFinite(options.iconRefraction)) test.iconRefraction = clamp(options.iconRefraction, 0, 1);
        if (options.scene === "theme" || options.scene === "calibration") test.scene = options.scene;
      }
      if (options.reset) settleToSelected(true);
      stop(); if (geometry) { drawScene(); measure(); } else requestFrame();
      return this.diagnostics();
    },
    destroy() {
      destroyed = true; clearGesture(); stop(); observer.disconnect(); themeObserver.disconnect(); resizeObserver?.disconnect();
      listeners.forEach(([target, type, callback, options]) => type === "legacy-media" ? target.removeListener(callback) : target.removeEventListener(type, callback, options));
      renderer?.destroy(); canvas.remove(); indicator.remove();
      if (nav) { nav.classList.remove("liquid-enhanced"); delete nav.dataset.liquidMode; delete nav.dataset.liquidContent; }
    }
  });
  if (document.fonts) {
    document.fonts.ready.then(() => { if (!destroyed) measure(); });
    if (document.fonts.addEventListener) listen(document.fonts, "loadingdone", measure);
  }
  if (document.readyState === "loading") listen(document, "DOMContentLoaded", reconcile, { once: true });
  else reconcile();
})(typeof window !== "undefined" ? window : globalThis);
