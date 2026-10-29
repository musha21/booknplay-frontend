/**
 * Procedural equipment point clouds — accurate sport silhouettes.
 * Returns Float32Arrays: positions (xyz * N) and colorIndices (int * N) per shape key.
 */

const TAU = Math.PI * 2;
const SCALE = 1.24;

function createRng(seed = 429) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function sortPoints(xs, ys, zs, cs, n) {
  const order = Array.from({ length: n }, (_, i) => i);
  order.sort((a, b) => ys[a] - ys[b] || xs[a] - xs[b]);
  const ox = new Float32Array(n);
  const oy = new Float32Array(n);
  const oz = new Float32Array(n);
  const oc = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = order[i];
    ox[i] = xs[j];
    oy[i] = ys[j];
    oz[i] = zs[j];
    oc[i] = cs[j];
  }
  return { positions: interleave(ox, oy, oz, n), colors: oc };
}

function interleave(xs, ys, zs, n) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = xs[i];
    out[i * 3 + 1] = ys[i];
    out[i * 3 + 2] = zs[i];
  }
  return out;
}

function fibSphere(i, n) {
  const y = 1 - (2 * (i + 0.5)) / n;
  const a = i * 2.3999632297;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
}

export function generateShapeLibrary(count) {
  const N = count;
  const random = createRng(429);
  const pent = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  for (const a of [-1, 1]) {
    for (const b of [-1, 1]) {
      pent.push([0, a, b * phi], [a, b * phi, 0], [b * phi, 0, a]);
    }
  }
  pent.forEach((v) => {
    const l = Math.hypot(...v);
    for (let k = 0; k < 3; k++) v[k] /= l;
  });

  const keys = ['football', 'cricket', 'badminton', 'basketball', 'tennis', 'pool', 'swimming', 'cloud'];
  const buckets = Object.fromEntries(
    keys.map((k) => [k, { x: new Float32Array(N), y: new Float32Array(N), z: new Float32Array(N), c: new Float32Array(N) }]),
  );

  for (let i = 0; i < N; i++) {
    const { x, y, z } = fibSphere(i, N);
    const u = random();
    const v = random();
    const w = random();
    const theta = random() * TAU;

    // —— Football: hex panels + lime seam lines ——
    {
      let near = -1;
      let second = -1;
      for (const pv of pent) {
        const d = x * pv[0] + y * pv[1] + z * pv[2];
        if (d > near) {
          second = near;
          near = d;
        } else if (d > second) second = d;
      }
      const seamGap = near - second;
      const R = 1.45 * SCALE;
      buckets.football.x[i] = x * R;
      buckets.football.y[i] = y * R;
      buckets.football.z[i] = z * R;
      // 0 = body, 1/7 = lime seams (7 = brightest), 3 = thin panel-edge
      if (seamGap < 0.055) buckets.football.c[i] = i % 3 === 0 ? 7 : 1;
      else if (near > 0.97) buckets.football.c[i] = 3;
      else buckets.football.c[i] = 0;
    }

    // —— Cricket: long tapered bat (~70%) + ball with seam (~30%) ——
    {
      let bx;
      let by;
      let bz;
      let c;
      if (i < N * 0.3) {
        const h = random() * 2 - 1;
        const rr = Math.sqrt(Math.max(0, 1 - h * h));
        const ang = random() * TAU;
        const ballR = 0.34;
        bx = 1.12 + rr * Math.cos(ang) * ballR;
        by = -0.62 + h * ballR;
        bz = 0.5 + rr * Math.sin(ang) * ballR;
        c = 1;
        // equatorial seam ring — bright lime on dark
        if (Math.abs(h) < 0.14 || Math.abs(Math.sin(ang * 2)) < 0.12) c = 7;
      } else if (i < N * 0.48) {
        // denser grip rings on handle
        by = 0.78 + u * 1.12;
        const ang = v * TAU;
        const ring = 0.02 * Math.sin(by * 36);
        const rad = 0.09 + ring;
        bx = rad * Math.cos(ang);
        bz = rad * Math.sin(ang);
        c = Math.sin(by * 100) > 0.25 ? 2 : 0;
      } else {
        // longer blade with clear edge spine
        by = -1.72 + u * 2.52;
        const width = by > 0.48
          ? 0.34 - (by - 0.48) * 0.85
          : 0.4 * (0.88 + 0.12 * Math.sin(Math.PI * Math.max(0, Math.min(1, (by + 1.72) / 2.2))));
        bx = (v * 2 - 1) * width;
        const depth = 0.18 + 0.14 * (1 - Math.abs(bx) / Math.max(width, 0.01));
        bz = (w > 0.52 ? 1 : -1) * (w > 0.55 ? depth : 0.1);
        c = 4;
        if (Math.abs(bx) > width * 0.92) c = 3; // thin edge only
        if (by > -0.1 && by < 0.28) c = 0;
        if (by < -1.52) by += 0.09 * (bx / Math.max(width, 0.01)) ** 2;
      }
      const tilt = -0.3;
      buckets.cricket.x[i] = (bx * Math.cos(tilt) - by * Math.sin(tilt)) * SCALE;
      buckets.cricket.y[i] = (bx * Math.sin(tilt) + by * Math.cos(tilt)) * SCALE;
      buckets.cricket.z[i] = bz * SCALE;
      buckets.cricket.c[i] = c;
    }

    // —— Badminton shuttle: cork + straight feather spokes ——
    {
      let sx;
      let sy;
      let sz;
      let sc;
      if (i < N * 0.16) {
        const t = random();
        const ang = random() * TAU;
        sy = -1.08 + t * 0.42;
        const rr = 0.32 * Math.sqrt(Math.max(0, 1 - ((sy + 0.84) / 0.28) ** 2));
        sx = rr * Math.cos(ang);
        sz = rr * Math.sin(ang);
        sc = 1;
      } else {
        const feather = i % 22;
        const t = Math.pow(random(), 0.92);
        const base = (feather * TAU) / 22;
        const rr = 0.2 + 0.95 * t;
        // mostly on spoke; tiny jitter only
        const offset = i % 5 === 0 ? 0 : (random() - 0.5) * 0.035;
        const ang = base + offset;
        sx = rr * Math.cos(ang);
        sz = rr * Math.sin(ang);
        sy = -0.58 + t * 2.0;
        sc = offset === 0 ? 1 : 0; // body fill on feathers, lime on spokes
        if (t < 0.12) sc = 1;
        if (t > 0.92) sc = 2;
      }
      const st = 0.22;
      buckets.badminton.x[i] = (sx * Math.cos(st) - sy * Math.sin(st)) * SCALE;
      buckets.badminton.y[i] = (sx * Math.sin(st) + sy * Math.cos(st)) * SCALE;
      buckets.badminton.z[i] = sz * SCALE;
      buckets.badminton.c[i] = sc;
    }

    // —— Basketball: equator + meridian seams ——
    {
      const R = 1.42 * SCALE;
      const seam = Math.min(
        Math.abs(x),
        Math.abs(y),
        Math.abs(z),
        Math.abs(x * 0.7 + z * 0.7),
        Math.abs(y * 0.65 - z * 0.75),
        Math.abs(z - 0.48 * x * x + 0.18),
      );
      buckets.basketball.x[i] = x * R;
      buckets.basketball.y[i] = y * R;
      buckets.basketball.z[i] = z * R;
      if (seam < 0.052) {
        // equator (abs y small) gets brightest lime highlights
        buckets.basketball.c[i] = Math.abs(y) < 0.12 || i % 4 === 0 ? 7 : 1;
      } else {
        buckets.basketball.c[i] = 0;
      }
    }

    // —— Tennis: oval frame, dense strings, grip, ball ——
    {
      let tx;
      let ty;
      let tz;
      let tc;
      const part = i / N;
      if (part < 0.3) {
        const tube = random() * TAU;
        const ovalX = 0.7 + 0.045 * Math.cos(tube);
        const ovalY = 0.88 + 0.045 * Math.cos(tube);
        tx = ovalX * Math.cos(theta);
        ty = 0.68 + ovalY * Math.sin(theta);
        tz = 0.048 * Math.sin(tube);
        tc = i % 7 === 0 ? 1 : 0;
      } else if (part < 0.58) {
        const cols = 12;
        const rows = 14;
        const cx = ((i % cols) / (cols - 1)) * 2 - 1;
        const cy = ((Math.floor(i / cols) % rows) / (rows - 1)) * 2 - 1;
        const inside = Math.max(0, 1 - (cx * cx * 0.85 + cy * cy));
        if (inside <= 0.02) {
          tx = (random() - 0.5) * 0.2;
          ty = 0.68;
          tz = 0;
          tc = 1;
        } else {
          tx = cx * 0.62;
          ty = 0.68 + cy * 0.82;
          tz = 0.01;
          tc = 1;
        }
      } else if (part < 0.68) {
        const h = random();
        tx = (i % 2 ? 1 : -1) * 0.34 * (1 - h);
        ty = 0.02 - 0.62 * h;
        tz = 0.035 * Math.sin(theta);
        tc = 0;
      } else if (part < 0.84) {
        ty = -1.78 + random() * 1.0;
        tx = 0.1 * Math.cos(theta);
        tz = 0.09 * Math.sin(theta);
        tc = Math.sin(ty * 110) > 0.15 ? 2 : 0;
      } else {
        const h = random() * 2 - 1;
        const rr = Math.sqrt(Math.max(0, 1 - h * h));
        tx = 1.2 + rr * Math.cos(theta) * 0.32;
        ty = -0.65 + h * 0.32;
        tz = 0.4 + rr * Math.sin(theta) * 0.32;
        // curved tennis-ball seam
        const seam = Math.abs(Math.sin(theta + h * 1.4) * Math.cos(h * 2.2));
        tc = seam < 0.18 ? 2 : 1;
      }
      const rt = -0.18;
      buckets.tennis.x[i] = (tx * Math.cos(rt) - ty * Math.sin(rt)) * SCALE;
      buckets.tennis.y[i] = (tx * Math.sin(rt) + ty * Math.cos(rt)) * SCALE;
      buckets.tennis.z[i] = tz * SCALE;
      buckets.tennis.c[i] = tc;
    }

    // —— Pool: round 8-ball + white circle / 8 hint + straight cue ——
    {
      if (i < N * 0.76) {
        const h = 1 - (2 * (i + 0.5)) / (N * 0.76);
        const ang = i * 2.3999632297;
        const rr = Math.sqrt(Math.max(0, 1 - h * h));
        const xx = rr * Math.cos(ang);
        const zz = rr * Math.sin(ang);
        // body = 0; white circle = 8; figure-8 / accents = lime 1/7
        let col = 0;
        if (zz > 0.55) {
          col = 8;
          const e1 = (xx / 0.2) ** 2 + ((h - 0.1) / 0.18) ** 2;
          const e2 = (xx / 0.2) ** 2 + ((h + 0.12) / 0.18) ** 2;
          if (Math.abs(e1 - 1) < 0.45 || Math.abs(e2 - 1) < 0.45) col = 7;
          if (Math.hypot(xx, h) < 0.12) col = 1;
        } else if (i % 11 === 0) {
          col = 1; // sparse lime speckles on dark ball body
        }
        buckets.pool.x[i] = (xx * 1.15 - 0.28) * SCALE;
        buckets.pool.y[i] = h * 1.15 * SCALE;
        buckets.pool.z[i] = zz * 1.15 * SCALE;
        buckets.pool.c[i] = col;
      } else if (i < N * 0.95) {
        // straighter tapered cue
        const h = random();
        const th = random() * TAU;
        const rad = 0.028 + 0.018 * (1 - h);
        buckets.pool.x[i] = (0.82 + h * 0.7 + rad * Math.cos(th)) * SCALE;
        buckets.pool.y[i] = (-1.55 + 3.05 * h) * SCALE;
        buckets.pool.z[i] = rad * Math.sin(th) * SCALE;
        buckets.pool.c[i] = h > 0.9 ? 7 : h < 0.28 ? 0 : 4;
      } else {
        const h = random() * 2 - 1;
        const rr = Math.sqrt(Math.max(0, 1 - h * h)) * 0.065;
        const ang = random() * TAU;
        buckets.pool.x[i] = (1.48 + rr * Math.cos(ang)) * SCALE;
        buckets.pool.y[i] = (1.42 + h * 0.04) * SCALE;
        buckets.pool.z[i] = rr * Math.sin(ang) * SCALE;
        buckets.pool.c[i] = 7;
      }
    }

    // —— Swimming: twin lenses, thick rims, bridge, strap ——
    {
      let gx;
      let gy;
      let gz;
      let gc;
      const side = i % 2 ? 1 : -1;
      if (i < N * 0.4) {
        const ang = random() * TAU;
        const rad = Math.pow(random(), 0.55);
        gx = side * 0.7 + Math.cos(ang) * 0.5 * rad;
        gy = Math.sin(ang) * 0.36 * rad;
        gz = 0.3 + 0.22 * (1 - rad * rad);
        gc = 2;
      } else if (i < N * 0.66) {
        const ang = random() * TAU;
        const tube = random() * TAU;
        gx = side * 0.7 + Math.cos(ang) * (0.52 + 0.06 * Math.cos(tube));
        gy = Math.sin(ang) * (0.4 + 0.06 * Math.cos(tube));
        gz = 0.26 + 0.06 * Math.sin(tube);
        gc = 0;
      } else if (i < N * 0.76) {
        gx = (random() - 0.5) * 0.28;
        gy = 0.05 + (random() - 0.5) * 0.06;
        gz = 0.3;
        gc = 1;
      } else {
        const a2 = random() * Math.PI;
        gx = Math.cos(a2) * 1.2;
        gz = -0.05 - 1.05 * Math.sin(a2);
        gy = (random() - 0.5) * 0.14;
        gc = 6;
      }
      buckets.swimming.x[i] = gx * 1.18 * SCALE;
      buckets.swimming.y[i] = gy * 1.18 * SCALE;
      buckets.swimming.z[i] = gz * SCALE;
      buckets.swimming.c[i] = gc;
    }

    // Cloud start
    buckets.cloud.x[i] = (random() - 0.5) * 6.2;
    buckets.cloud.y[i] = (random() - 0.5) * 4.2;
    buckets.cloud.z[i] = (random() - 0.5) * 5.2;
    buckets.cloud.c[i] = 0;
  }

  const library = {};
  for (const key of keys) {
    const b = buckets[key];
    library[key] = sortPoints(b.x, b.y, b.z, b.c, N);
  }
  return library;
}
