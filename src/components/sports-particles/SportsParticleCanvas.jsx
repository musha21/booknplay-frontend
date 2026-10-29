import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateShapeLibrary } from './shapes/generateShapes';
import {
  CYCLE_DURATION,
  FORM_DURATION,
  HOLD_DURATION,
  LOOP_SHAPE_KEYS,
  MORPH_DURATION,
  particleBudget,
  paletteForMode,
  smoothstep,
} from './morphTiming';

function ParticleField({ lockedShapeKey = null, isMobile = false, themeMode = 'light' }) {
  const pointsRef = useRef(null);
  const stateRef = useRef({
    t: 0,
    manual: null,
    mFromPos: null,
    mFromCol: null,
    mStart: 0,
    prevLocked: null,
  });

  const count = particleBudget(isMobile);
  const library = useMemo(() => generateShapeLibrary(count), [count]);
  const palette = useMemo(() => paletteForMode(themeMode), [themeMode]);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cloud = library.cloud;
    const c0 = palette[0];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = cloud.positions[i * 3];
      pos[i * 3 + 1] = cloud.positions[i * 3 + 1];
      pos[i * 3 + 2] = cloud.positions[i * 3 + 2];
      col[i * 3] = c0[0];
      col[i * 3 + 1] = c0[1];
      col[i * 3 + 2] = c0[2];
    }
    return { positions: pos, colors: col };
  }, [count, library, palette]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const s = stateRef.current;
    if (lockedShapeKey && library[lockedShapeKey]) {
      const cur = captureCurrent(library, s, count);
      s.mFromPos = cur.pos;
      s.mFromCol = cur.col;
      s.manual = lockedShapeKey;
      s.mStart = s.t;
    } else if (s.manual != null && !lockedShapeKey) {
      const idx = Math.max(0, LOOP_SHAPE_KEYS.indexOf(s.manual));
      s.t = FORM_DURATION + idx * CYCLE_DURATION;
      s.manual = null;
      s.mFromPos = null;
      s.mFromCol = null;
    }
    s.prevLocked = lockedShapeKey;
  }, [lockedShapeKey, library, count]);

  useFrame((_, delta) => {
    const mesh = pointsRef.current;
    if (!mesh) return;
    const s = stateRef.current;
    const dt = Math.min(delta, 0.04);
    s.t += dt;

    const cfg = resolveConfig(library, s);
    const posAttr = mesh.geometry.attributes.position;
    const colAttr = mesh.geometry.attributes.color;
    const fromPos = cfg.fromPos;
    const toPos = cfg.toPos;
    const fromCol = cfg.fromCol;
    const toCol = cfg.toCol;
    const mix = cfg.mix;
    const t = s.t;
    const floatY = Math.sin(t * 0.85) * 0.055;
    // Keep yaw gentle so flat equipment (bat/racket) does not collapse edge-on
    const angle = Math.sin(t * 0.35) * 0.22 + 0.08;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const tilt = 0.08;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const arc = Math.sin(mix * Math.PI) * 0.16;
      let x = fromPos[i3] + (toPos[i3] - fromPos[i3]) * mix + Math.sin(i * 1.7 + t * 0.3) * arc;
      let y = fromPos[i3 + 1] + (toPos[i3 + 1] - fromPos[i3 + 1]) * mix + floatY;
      let z = fromPos[i3 + 2] + (toPos[i3 + 2] - fromPos[i3 + 2]) * mix + Math.cos(i * 1.3) * arc;

      const xx = x * ca + z * sa;
      let zz = z * ca - x * sa;
      const yy = y * ct - zz * st;
      zz = y * st + zz * ct;

      posAttr.array[i3] = xx;
      posAttr.array[i3 + 1] = yy;
      posAttr.array[i3 + 2] = zz;

      const ciA = fromCol[i] | 0;
      const ciB = toCol[i] | 0;
      const ac = palette[ciA] || palette[0];
      const bc = palette[ciB] || palette[0];
      colAttr.array[i3] = ac[0] + (bc[0] - ac[0]) * mix;
      colAttr.array[i3 + 1] = ac[1] + (bc[1] - ac[1]) * mix;
      colAttr.array[i3 + 2] = ac[2] + (bc[2] - ac[2]) * mix;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    mesh.rotation.y = 0;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={isMobile ? (themeMode === 'dark' ? 0.078 : 0.07) : (themeMode === 'dark' ? 0.064 : 0.056)}
        vertexColors
        sizeAttenuation
        transparent
        opacity={themeMode === 'dark' ? 0.98 : 0.96}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

function captureCurrent(library, s, count) {
  const cfg = resolveConfig(library, s);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count);
  const mix = cfg.mix;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    pos[i3] = cfg.fromPos[i3] + (cfg.toPos[i3] - cfg.fromPos[i3]) * mix;
    pos[i3 + 1] = cfg.fromPos[i3 + 1] + (cfg.toPos[i3 + 1] - cfg.fromPos[i3 + 1]) * mix;
    pos[i3 + 2] = cfg.fromPos[i3 + 2] + (cfg.toPos[i3 + 2] - cfg.fromPos[i3 + 2]) * mix;
    col[i] = mix < 0.5 ? cfg.fromCol[i] : cfg.toCol[i];
  }
  return { pos, col };
}

function resolveConfig(library, s) {
  if (s.manual && library[s.manual]) {
    const to = library[s.manual];
    const fromPos = s.mFromPos || library.cloud.positions;
    const fromCol = s.mFromCol || library.cloud.colors;
    return {
      fromPos,
      toPos: to.positions,
      fromCol,
      toCol: to.colors,
      mix: smoothstep((s.t - s.mStart) / MORPH_DURATION),
    };
  }

  if (s.t < FORM_DURATION) {
    return {
      fromPos: library.cloud.positions,
      toPos: library.football.positions,
      fromCol: library.cloud.colors,
      toCol: library.football.colors,
      mix: smoothstep(s.t / FORM_DURATION),
    };
  }

  const cycle = (s.t - FORM_DURATION) % (LOOP_SHAPE_KEYS.length * CYCLE_DURATION);
  const idx = Math.floor(cycle / CYCLE_DURATION);
  const phase = cycle % CYCLE_DURATION;
  const fromKey = LOOP_SHAPE_KEYS[idx];
  const toKey = LOOP_SHAPE_KEYS[(idx + 1) % LOOP_SHAPE_KEYS.length];
  const from = library[fromKey];
  const to = library[toKey];
  const mix = phase < HOLD_DURATION ? 0 : smoothstep((phase - HOLD_DURATION) / MORPH_DURATION);
  return {
    fromPos: from.positions,
    toPos: to.positions,
    fromCol: from.colors,
    toCol: to.colors,
    mix,
  };
}

function SceneChrome({ children }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    gl.setClearColor(new THREE.Color('#ffffff'), 0);
  }, [gl]);
  return children;
}

export default function SportsParticleCanvas({
  lockedShapeKey = null,
  paused = false,
  themeMode = 'light',
}) {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <Canvas
      className="hp-sport-particle-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 5.6], fov: 42, near: 0.1, far: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      frameloop={paused ? 'never' : 'always'}
      style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
    >
      <SceneChrome>
        <ambientLight intensity={0.6} />
        <ParticleField
          lockedShapeKey={lockedShapeKey}
          isMobile={isMobile}
          themeMode={themeMode}
        />
      </SceneChrome>
    </Canvas>
  );
}
