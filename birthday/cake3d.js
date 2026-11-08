import * as THREE from './js/three.module.js';

var LAYERS = [
    [1.90, 0.85, '#5E3592'],
    [1.36, 0.72, '#8A5CC8'],
    [0.88, 0.60, '#B794DE']
];
var PLATE_COLOR = '#E4D9F2';
var CANDLE_COLOR = '#EDE3F7';
var FLAME_OUTER = '#FF7A1A';
var FLAME_INNER = '#FFE9A8';
var HB_COLOR = '#5E3592';
var SPCOL = ['#C9A7EB', '#E8D9F7', '#A26BD1', '#D9C2F0', '#8B5FBF', '#FFFFFF'];
var RPAL = ['#4B0082', '#6A3FA0', '#8A5CC8', '#A97FD9', '#C7A8E8', '#E0CFF5', '#9B59D0', '#D8B4FE'];
var CPAL = ['#6A3FA0', '#9563C9', '#C4A3E8', '#E0CFF5', '#4B0082', '#B98CE0', '#7B4FA8', '#EFE4FB'];
var NCOL = { 3: '#8A5CC8', 2: '#6A3FA0', 1: '#4B0082' };

var CD0 = 3;
var SPN = 12;
var CDEND = CD0 * SPN;
var HBPOP = CDEND + 10;
var HBHOLD = CDEND + 45;
var HBFADE = CDEND + 65;
var CAKEEF = CDEND + 70;
var BLIFE = 110;
var GRAV = 0.012;
var RSPD = 0.4;
var FDELAY = 0.04;
var NB = 150;
var NC = 500;
var CTOP = 11.0;
var CBOT = -2.0;
var HBZ = 2.4;
var BORIG = [0.0, 0.0, 2.4];
var CPOS = [4.8, -5.3, 3.8];
var CTGT = [0.0, 0.0, 1.7];

var PX_TO_WORLD = 0.011;

function px(v) { return v * PX_TO_WORLD; }

function compactViewport() {
    return Math.min(window.innerWidth, window.innerHeight) < 760;
}

function makeResize(stage, renderer, camera, pr) {
    return function () {
        var box = stage.getBoundingClientRect();
        var w = box.width || stage.clientWidth || window.innerWidth;
        var h = box.height || stage.clientHeight || window.innerHeight;
        var maxSide = 1600;
        var ratio = Math.min(1, maxSide / Math.max(w * pr, h * pr));
        var pw = Math.max(1, Math.floor(w * ratio * pr));
        var ph = Math.max(1, Math.floor(h * ratio * pr));
        if (renderer.domElement.width !== pw || renderer.domElement.height !== ph) {
            renderer.setSize(w * ratio, h * ratio, false);
            camera.aspect = w / h;
            // 相机按横屏设计，竖屏 aspect < 1 时水平视野太窄会把蛋糕/文字左右裁掉，
            // 放宽纵向 fov 把内容收进画面（上限 82° 避免透视畸变）
            camera.fov = camera.aspect < 1 ? Math.min(82, 50 / Math.max(0.62, camera.aspect)) : 50;
            camera.updateProjectionMatrix();
        }
    };
}

function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
        a += 0x6D2B79F5;
        var t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function sphereTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var g2 = g.createRadialGradient(32, 32, 0, 32, 32, 30);
    g2.addColorStop(0, 'rgba(255,255,255,1)');
    g2.addColorStop(0.78, 'rgba(255,255,255,1)');
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = g2;
    g.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
}

function pointsMat(size, sprite, opaque) {
    return new THREE.PointsMaterial({
        size: px(size),
        map: sprite,
        transparent: true,
        alphaTest: 0.5,
        depthWrite: opaque !== false,
        vertexColors: true,
        sizeAttenuation: true
    });
}

function fill(arr, offset, rgb) {
    arr[offset] = rgb[0]; arr[offset + 1] = rgb[1]; arr[offset + 2] = rgb[2];
}

function hexRGB(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function lighter(rgb, a) {
    return [rgb[0] + (1 - rgb[0]) * a, rgb[1] + (1 - rgb[1]) * a, rgb[2] + (1 - rgb[2]) * a];
}

function mixRgb(c, tgt, k) {
    return [c[0] + (tgt[0] - c[0]) * k, c[1] + (tgt[1] - c[1]) * k, c[2] + (tgt[2] - c[2]) * k];
}

function makePoints(pos, col, size, sprite, opaque, soft) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = pointsMat(size, sprite, opaque);
    if (soft) {
        mat.alphaTest = 0.02;
        mat.depthWrite = false;
    }
    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    return pts;
}

function softSprite() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)');
    gr.addColorStop(0.3, 'rgba(255,255,255,0.5)');
    gr.addColorStop(0.62, 'rgba(255,255,255,0.14)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
}

function ghostOf(pts, size, opacity) {
    var mat = pts.material.clone();
    mat.size = px(size);
    mat.opacity = opacity;
    var echo = new THREE.Points(pts.geometry, mat);
    echo.frustumCulled = false;
    return echo;
}

function randSeed() {
    return (Math.random() * 4294967296) >>> 0;
}

function makePointer(stage) {
    var p = { tx: 0, ty: 0, x: 0, y: 0, has: false };

    function track(e) {
        var b = stage.getBoundingClientRect();
        var w = b.width || window.innerWidth;
        var h = b.height || window.innerHeight;
        p.tx = ((e.clientX - b.left) / w) * 2 - 1;
        p.ty = -(((e.clientY - b.top) / h) * 2 - 1);
        p.has = true;
    }

    function rest() {
        p.tx = 0;
        p.ty = 0;
    }

    window.addEventListener('pointermove', track);
    window.addEventListener('pointerdown', track);
    document.addEventListener('mouseleave', rest);
    return {
        p: p,
        smooth: function (k) {
            p.x += (p.tx - p.x) * k;
            p.y += (p.ty - p.y) * k;
        },
        detach: function () {
            window.removeEventListener('pointermove', track);
            window.removeEventListener('pointerdown', track);
            document.removeEventListener('mouseleave', rest);
        }
    };
}

function makeInteract(camera) {
    var recs = [];
    var w = new THREE.Vector3(), q = new THREE.Vector3(), hit = new THREE.Vector3();
    var origin = new THREE.Vector3(), dir = new THREE.Vector3();
    var m = new THREE.Matrix4(), mi = new THREE.Matrix4();

    return {
        add: function (pts, base, r, s) {
            recs.push({ pts: pts, base: base, cb: pts.geometry.attributes.color.array.slice(), r: r, s: s });
        },
        apply: function (active, nx, ny) {
            origin.copy(camera.position);
            hit.set(nx, ny, 0.5).unproject(camera);
            dir.copy(hit).sub(origin).normalize();
            for (var k = 0; k < recs.length; k++) {
                var rec = recs[k], b = rec.base, cb = rec.cb;
                var geo = rec.pts.geometry;
                var arr = geo.attributes.position.array, col = geo.attributes.color.array;
                if (!active) {
                    arr.set(b);
                    col.set(cb);
                    geo.attributes.position.needsUpdate = true;
                    geo.attributes.color.needsUpdate = true;
                    continue;
                }
                m.copy(rec.pts.matrixWorld);
                mi.copy(m).invert();
                for (var i = 0, n = b.length / 3; i < n; i++) {
                    var o = i * 3;
                    w.set(b[o], b[o + 1], b[o + 2]).applyMatrix4(m);
                    q.copy(w).sub(origin);
                    var t = q.dot(dir);
                    var dx = q.x - dir.x * t, dy = q.y - dir.y * t, dz = q.z - dir.z * t;
                    var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    var f = len < rec.r && len > 1e-5 ? 1 - len / rec.r : 0;
                    if (f > 0) {
                        var g = f * rec.s / len;
                        w.x += dx * g; w.y += dy * g; w.z += dz * g;
                    }
                    w.applyMatrix4(mi);
                    arr[o] = w.x; arr[o + 1] = w.y; arr[o + 2] = w.z;
                    col[o] = cb[o] + (1 - cb[o]) * f * 0.85;
                    col[o + 1] = cb[o + 1] + (1 - cb[o + 1]) * f * 0.85;
                    col[o + 2] = cb[o + 2] + (1 - cb[o + 2]) * f * 0.85;
                }
                geo.attributes.position.needsUpdate = true;
                geo.attributes.color.needsUpdate = true;
            }
        }
    };
}

function captureCam(camera, out) {
    out.pos.copy(camera.position);
    camera.updateMatrixWorld();
    var e = camera.matrixWorld.elements;
    out.right.set(e[0], e[1], e[2]);
    out.up.set(e[4], e[5], e[6]);
    return out;
}

function parallax(out, camera, nx, ny, amt) {
    out.tmp.copy(out.pos)
        .addScaledVector(out.right, nx * amt)
        .addScaledVector(out.up, ny * amt * 0.75);
    camera.position.copy(out.tmp);
    camera.lookAt(out.tgt);
}

function sampleCylinder(r, h, z, count, rnd) {
    var pos = new Float32Array(count * 3);
    var col = new Float32Array(count * 3);
    var sideN = Math.floor(count * 0.68);
    for (var i = 0; i < count; i++) {
        var th = rnd() * Math.PI * 2;
        var rr, zz;
        if (i < sideN) {
            rr = r * (0.985 + rnd() * 0.03);
            zz = z + rnd() * h;
        } else {
            rr = Math.sqrt(rnd()) * r * 0.99;
            zz = z + h - rnd() * 0.03;
        }
        pos[i * 3] = rr * Math.cos(th);
        pos[i * 3 + 1] = rr * Math.sin(th);
        pos[i * 3 + 2] = zz;
        col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1;
    }
    return { pos: pos, col: col };
}

function sampleEllipsoid(cx, cy, cz, ra, rb, rc, count, rnd) {
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
        var u = rnd() * 2 - 1;
        var t = rnd() * Math.PI * 2;
        var s = Math.sqrt(1 - u * u);
        var k = Math.cbrt(rnd());
        pos[i * 3] = cx + ra * k * s * Math.cos(t);
        pos[i * 3 + 1] = cy + rb * k * s * Math.sin(t);
        pos[i * 3 + 2] = cz + rc * k * u;
    }
    return pos;
}

function textPoints(str, opts) {
    var fsize = opts.fsize || 200;
    var pad = 40;
    var step = opts.step || 2;
    var tw = opts.tw || 5.0;
    var c = document.createElement('canvas');
    var g = c.getContext('2d');
    var font = fsize + 'px "PingFang SC", "Microsoft YaHei", sans-serif';
    g.font = font;
    var w = Math.ceil(g.measureText(str).width) + pad * 2;
    var h = Math.ceil(fsize * 1.25) + pad * 2;
    c.width = w; c.height = h;
    g = c.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    g.font = font;
    g.fillStyle = '#fff';
    g.textBaseline = 'top';
    g.fillText(str, pad, pad);
    var data = g.getImageData(0, 0, w, h).data;
    var xs = [], ys = [];
    for (var y = 0; y < h; y += 1) {
        for (var x = 0; x < w; x += 1) {
            if (data[(y * w + x) * 4] > 128) { xs.push(x); ys.push(y); }
        }
    }
    var out = [];
    for (var i = 0; i < xs.length; i += step) {
        out.push([(xs[i] - w / 2.0) * (tw / w), -(ys[i] - h / 2.0) * (tw / w)]);
    }
    return out;
}

function extrudeText(str, opts, thickness, count, rnd) {
    var pts2d = textPoints(str, opts);
    var pos = new Float32Array(count * 3);
    var col = new Float32Array(count * 3);
    if (!pts2d.length) return { pos: pos, col: col, w: 0, h: 0, zTop: thickness / 2 };
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts2d.forEach(function (p) {
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
    });
    for (var i = 0; i < count; i++) {
        var p = pts2d[Math.floor(rnd() * pts2d.length)];
        var jitter = 0.02 * (maxX - minX);
        pos[i * 3] = p[0] + (rnd() - 0.5) * jitter;
        pos[i * 3 + 1] = p[1] + (rnd() - 0.5) * jitter;
        pos[i * 3 + 2] = (rnd() - 0.5) * thickness;
    }
    return { pos: pos, col: col, w: maxX - minX, h: maxY - minY, zTop: thickness / 2,
        minY: minY, maxY: maxY, minX: minX, maxX: maxX };
}

function ribbonGeometry(L, W, seg, wv) {
    var verts = [], idx = [];
    for (var i = 0; i < seg; i++) {
        var t = i / (seg - 1);
        var x = 0.08 * Math.sin(t * Math.PI * wv);
        var z = -t * L;
        verts.push([x - W / 2, 0, z], [x + W / 2, 0, z]);
    }
    for (var s = 0; s < seg - 1; s++) {
        var l0 = s * 2, r0 = s * 2 + 1, l1 = s * 2 + 2, r1 = s * 2 + 3;
        idx.push(l0, r0, r1, l0, r1, l1);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts.flat(), 3));
    geo.setIndex(idx);
    return geo;
}

function build(stage, opts) {
    var seed = randSeed();
    var rnd = mulberry(seed);
    var brng = mulberry(seed ^ 0x9E3779B9);
    var crng = mulberry(seed ^ 0x85EBCA6B);
    var sprite = sphereTexture();
    var glow = softSprite();

    // 手机 GPU 上关掉抗锯齿、把像素比压到 1.5，点云动画才不会掉帧
    var renderer = new THREE.WebGLRenderer({ antialias: !compactViewport(), alpha: true });
    var pr = Math.min(window.devicePixelRatio || 1, compactViewport() ? 1.5 : 2);
    renderer.setPixelRatio(pr);
    renderer.domElement.className = 'cake-canvas';
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);

    var cake = new THREE.Group();
    var z = 0.0;
    LAYERS.forEach(function (L) {
        var n = 26000;
        var s = sampleCylinder(L[0], L[1], z, n, rnd);
        var c = hexRGB(L[2]);
        var sc2 = lighter(c, 0.14);
        for (var i = 0; i < n; i++) fill(s.col, i * 3, sc2);
        var body = makePoints(s.pos, s.col, 4.4, glow, false, true);
        body.material.opacity = 0.55;
        cake.add(body);
        var echo = ghostOf(body, 8.0, 0.12);
        echo.scale.set(1.05, 1.05, 1);
        cake.add(echo);
        var rimN = 1600;
        var rp = new Float32Array(rimN * 3);
        var rc = new Float32Array(rimN * 3);
        var rimC = lighter(c, 0.6);
        for (var e = 0; e < 2; e++) {
            var ze = e === 0 ? z : z + L[1];
            for (var i2 = e * rimN / 2; i2 < (e + 1) * rimN / 2; i2++) {
                var ae = rnd() * 2 * Math.PI;
                rp[i2 * 3] = L[0] * Math.cos(ae);
                rp[i2 * 3 + 1] = L[0] * Math.sin(ae);
                rp[i2 * 3 + 2] = ze + (rnd() - 0.5) * 0.012;
                fill(rc, i2 * 3, rimC);
            }
        }
        var rim = makePoints(rp, rc, 3.6, glow, false, true);
        rim.material.opacity = 0.85;
        cake.add(rim);
        var balls = 26, per = 150;
        var bp = new Float32Array(balls * per * 3);
        var bc = new Float32Array(balls * per * 3);
        var lc = lighter(c, 0.44);
        for (var b = 0; b < balls; b++) {
            var a = 2 * Math.PI * (b + 0.5) / balls;
            var one = sampleEllipsoid(L[0] * 1.03 * Math.cos(a), L[0] * 1.03 * Math.sin(a), z + L[1] - 0.05, 0.12, 0.12, 0.12, per, rnd);
            bp.set(one, b * per * 3);
            for (var k = 0; k < per; k++) fill(bc, (b * per + k) * 3, lc);
        }
        var beads = makePoints(bp, bc, 3.4, glow, false, true);
        beads.material.opacity = 0.9;
        cake.add(beads);
        z += L[1];
    });
    var tz = z;

    var tr = LAYERS[LAYERS.length - 1][0] * 1.03;
    var spkCount = 30 * 50;
    var spkPos = new Float32Array(spkCount * 3);
    var spkCol = new Float32Array(spkCount * 3);
    for (var k = 0; k < 30; k++) {
        var rad = tr * Math.sqrt(rnd()) * 0.92;
        var ang = rnd() * 2 * Math.PI;
        var one = sampleEllipsoid(rad * Math.cos(ang), rad * Math.sin(ang), tz + 0.02, 0.04, 0.04, 0.03, 50, rnd);
        spkPos.set(one, k * 50 * 3);
        var c = hexRGB(SPCOL[Math.floor(rnd() * SPCOL.length)]);
        for (var m = 0; m < 50; m++) fill(spkCol, (k * 50 + m) * 3, c);
    }
    var sparks = makePoints(spkPos, spkCol, 3.0, glow, false, true);
    sparks.material.opacity = 0.85;
    cake.add(sparks);

    var plateN = 12000;
    var platePos = new Float32Array(plateN * 3);
    var plateCol = new Float32Array(plateN * 3);
    var pc = hexRGB(PLATE_COLOR);
    for (var i = 0; i < plateN; i++) {
        var th = rnd() * 2 * Math.PI;
        var rr = Math.sqrt(4.2 + rnd() * 3.33);
        platePos[i * 3] = rr * Math.cos(th);
        platePos[i * 3 + 1] = rr * Math.sin(th);
        platePos[i * 3 + 2] = -0.05 + (rnd() + rnd() + rnd() - 1.5) * 0.012;
        fill(plateCol, i * 3, pc);
    }
    var plate = makePoints(platePos, plateCol, 3.0, glow, false, true);
    plate.material.opacity = 0.5;
    cake.add(plate);
    cake.visible = false;
    scene.add(cake);

    var CANDLE_R = 0.05;
    var CANDLE_H = 0.32;
    var CANDLE_N = 5;

    function flame(count, h, mr, colorHex, zOff, cx, cy, cz) {
        var p = new Float32Array(count * 3);
        var c = new Float32Array(count * 3);
        var rgb = hexRGB(colorHex);
        var base = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            var u = rnd();
            var yy = Math.pow(u, 0.7) * h;
            var shrink = 1 - yy / h;
            var r = mr * Math.sqrt(rnd()) * shrink;
            var a2 = rnd() * 2 * Math.PI;
            base[i * 3] = r * Math.cos(a2);
            base[i * 3 + 1] = r * Math.sin(a2);
            base[i * 3 + 2] = yy;
            p[i * 3] = base[i * 3];
            p[i * 3 + 1] = base[i * 3 + 1];
            p[i * 3 + 2] = base[i * 3 + 2] + zOff;
            fill(c, i * 3, rgb);
        }
        var mesh = makePoints(p, c, 1.2, sprite, false);
        mesh.position.set(cx, cy, cz);
        return { mesh: mesh, base: base, count: count, zOff: zOff };
    }

    var candleGroup = new THREE.Group();
    var flames = [];
    var candleRGB = hexRGB(CANDLE_COLOR);
    for (var ci = 0; ci < CANDLE_N; ci++) {
        var ca = 2 * Math.PI * ci / CANDLE_N + 0.4;
        var cx = Math.cos(ca) * tr * 0.55;
        var cy = Math.sin(ca) * tr * 0.55;
        var topZ = tz + 0.02 + CANDLE_H;
        var bodyData = sampleCylinder(CANDLE_R, CANDLE_H, 0, 1400, rnd);
        var bodyCol = new Float32Array(bodyData.pos.length);
        for (var bi = 0; bi < bodyCol.length; bi += 3) fill(bodyCol, bi, candleRGB);
        var body = makePoints(bodyData.pos, bodyCol, 2.8, glow, false, true);
        body.material.opacity = 0.7;
        body.position.set(cx, cy, tz + 0.02);
        candleGroup.add(body);
        var fO = flame(1400, 0.22, 0.055, FLAME_OUTER, 0, cx, cy, topZ);
        var fI = flame(1000, 0.15, 0.03, FLAME_INNER, 0.006, cx, cy, topZ);
        candleGroup.add(fO.mesh);
        candleGroup.add(fI.mesh);
        flames.push(fO, fI);
    }
    candleGroup.visible = false;
    scene.add(candleGroup);

    var nums = {};
    [3, 2, 1].forEach(function (n) {
        var d = extrudeText(String(n), { tw: 2.6, fsize: 260, step: 2 }, 0.5, 14000, rnd);
        var col = new Float32Array(d.pos.length);
        var rgb = hexRGB(NCOL[n]);
        for (var i = 0; i < col.length; i += 3) fill(col, i, rgb);
        var mesh = makePoints(d.pos, col, 3.2, sprite);
        var minY = Infinity;
        for (i = 1; i < d.pos.length; i += 3) if (d.pos[i] < minY) minY = d.pos[i];
        for (i = 1; i < d.pos.length; i += 3) d.pos[i] -= minY;
        mesh.geometry.attributes.position.needsUpdate = true;
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(0, 0, HBZ);
        mesh.visible = false;
        scene.add(mesh);
        nums[n] = mesh;
    });

    var hbData = textPoints('Happy Birthday', { tw: 5.0, fsize: 200, step: 2 });
    var hbPos = new Float32Array(hbData.length * 3);
    var hbCol = new Float32Array(hbData.length * 3);
    var hbC = hexRGB(HB_COLOR);
    for (i = 0; i < hbData.length; i++) {
        hbPos[i * 3] = hbData[i][0];
        hbPos[i * 3 + 1] = hbData[i][1];
        hbPos[i * 3 + 2] = 0;
        fill(hbCol, i * 3, hbC);
    }
    var hb = makePoints(hbPos, hbCol, 1.9, sprite);
    hb.rotation.x = Math.PI / 2;
    hb.position.set(0, 0, HBZ);
    hb.visible = false;
    scene.add(hb);

    var ribbons = [];
    var ribbonGroup = new THREE.Group();
    var rGeos = [], rMeshes = [];
    for (i = 0; i < NB; i++) {
        var L = 0.7 + brng() * 0.5;
        var W = 0.10 + brng() * 0.06;
        var geo = ribbonGeometry(L, W, 8, 2);
        var mat = new THREE.MeshBasicMaterial({
            color: RPAL[Math.floor(brng() * RPAL.length)],
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.visible = false;
        ribbonGroup.add(mesh);
        var th_ = brng() * 2 * Math.PI;
        var ph_ = Math.acos(2 * brng() - 1);
        var sp = 0.22 + brng() * 0.18;
        var iv = [sp * Math.sin(ph_) * Math.cos(th_), sp * Math.sin(ph_) * Math.sin(th_), sp * Math.cos(ph_) * 0.9 + 0.20];
        ribbons.push({
            mesh: mesh,
            pos: BORIG.slice(),
            v: iv.slice(),
            iv: iv.slice(),
            o: [brng() * 360, brng() * 360, brng() * 360],
            io: null,
            rs: [brng() * 50 - 25, brng() * 50 - 25, brng() * 50 - 25],
            bf: -1,
            act: false
        });
        ribbons[i].io = ribbons[i].o.slice();
    }
    scene.add(ribbonGroup);

    var cfPos = new Float32Array(NC * 3);
    var cfVel = new Float32Array(NC * 3);
    var cfCol = new Float32Array(NC * 3);
    function resetCF() {
        for (var i = 0; i < NC; i++) {
            cfPos[i * 3] = (crng() * 2 - 1) * 5;
            cfPos[i * 3 + 1] = (crng() * 2 - 1) * 5;
            cfPos[i * 3 + 2] = CBOT + crng() * (CTOP - CBOT);
            cfVel[i * 3] = (crng() * 2 - 1) * 0.02;
            cfVel[i * 3 + 1] = (crng() * 2 - 1) * 0.02;
            cfVel[i * 3 + 2] = -(0.08 + crng() * 0.10);
            var c = hexRGB(CPAL[Math.floor(crng() * 8)]);
            fill(cfCol, i * 3, c);
        }
    }
    resetCF();
    var confetti = makePoints(cfPos, cfCol, 2.6, sprite, false);
    confetti.visible = false;
    scene.add(confetti);

    var jit = 0.85 + rnd() * 0.3;
    var dec = makeRibbons(rnd, {
        n: Math.round(200 + rnd() * 110), size: 10, opacity: 0.95,
        speed: [0.02, 0.05], pal: RBPAL,
        box: { x: 6.6 * jit, y: 4.6 * jit, z0: CBOT, z1: CTOP }
    });
    dec.add(scene);

    var met = makeMeteors(rnd, {
        n: 3 + Math.floor(rnd() * 3), tail: 16, seg: 0.1, headSize: 8.5, tailDot: 4.6,
        speed: [0.12, 0.2], pal: SPAL, fade: SKY_RGB,
        box: { x: 6.6 * jit, y: 4.6 * jit, z0: CBOT - 1, z1: CTOP + 0.6 }
    });
    met.add(scene);

    var sky = makeStarfield(rnd, {
        n: Math.round(340 + rnd() * 160), sizes: [4, 5.2, 6.6], opacity: 0.85,
        sprite: sprite, pal: STARPAL,
        box: { x: 9.5 * jit, y: 7 * jit, z0: CBOT - 2, z1: CTOP + 3 }
    });
    sky.add(scene);

    var tiles = makeStarfield(rnd, {
        n: Math.round(90 + rnd() * 50), sizes: [16, 24, 34], opacity: 0.9,
        sprite: starSprite(), pal: STARPAL,
        box: { x: 9.5 * jit, y: 7 * jit, z0: CBOT - 2, z1: CTOP + 3 }
    });
    tiles.add(scene);

    var interact = makeInteract(camera);
    var pointer = makePointer(stage);
    function reg(sys, r, s) {
        sys.items.forEach(function (it) { interact.add(it.pts, it.base, r, s); });
    }
    reg(dec, 1.3, 1.1);
    reg(sky, 1.6, 0.95);
    reg(tiles, 1.8, 1.3);

    var frame = 0, rot = false, fall = false, bstart = false, st = { nf: -1, cur: 0 };
    var eul = new THREE.Euler();
    var q = new THREE.Quaternion();
    var camBase = { pos: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), tmp: new THREE.Vector3(), tgt: new THREE.Vector3(CTGT[0], CTGT[1], CTGT[2]) };
    var leanV = new THREE.Vector3();

    function setCam() {
        var d = [CPOS[0] - CTGT[0], CPOS[1] - CTGT[1], CPOS[2] - CTGT[2]];
        var len = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
        camera.position.set(CTGT[0] + d[0] / len * len, CTGT[1] + d[1] / len * len, CTGT[2] + d[2] / len * len);
        camera.up.set(0, 0, 1);
        camera.lookAt(CTGT[0], CTGT[1], CTGT[2]);
        captureCam(camera, camBase);
    }

    function hideAll() {
        cake.visible = false;
        candleGroup.visible = false;
        hb.visible = false;
        confetti.visible = false;
        Object.keys(nums).forEach(function (k) {
            nums[k].visible = false;
            nums[k].scale.set(1, 1, 1);
        });
        ribbons.forEach(function (r) {
            r.act = false; r.bf = -1;
            r.pos = BORIG.slice(); r.v = r.iv.slice(); r.o = r.io.slice();
            r.mesh.visible = false;
        });
    }

    function reset() {
        resetCF();
        confetti.geometry.attributes.position.needsUpdate = true;
        frame = 0; rot = false; fall = false; bstart = false;
        prev = 0; acc = 0;
        st = { nf: -1, cur: 0 };
        hideAll();
        setCam();
    }

    function deform(fl, br, dx, dy, dz) {
        var p = fl.mesh.geometry.attributes.position.array;
        var b = fl.base;
        for (var i = 0; i < p.length; i += 3) {
            p[i] = b[i] * br + dx;
            p[i + 1] = b[i + 1] * br + dy;
            p[i + 2] = b[i + 2] * br + dz;
        }
        fl.mesh.geometry.attributes.position.needsUpdate = true;
    }

    function tick() {
        frame += 1;
        var fr = frame;

        if (fr < CDEND) {
            var cur = CD0 - Math.floor(fr / SPN);
            if (cur !== st.cur) {
                if (nums[st.cur]) { nums[st.cur].visible = false; nums[st.cur].scale.set(1, 1, 1); }
                st.cur = cur; st.nf = fr;
                if (nums[cur]) nums[cur].visible = true;
            }
            var n = nums[st.cur];
            if (n) {
                var ts = (fr - st.nf) / SPN;
                var s = ts < 0.35 ? Math.max(1.0, 1.5 - 1.5 * (ts / 0.35)) : 1.0;
                n.scale.set(s, s, s);
            }
        } else if (fr === CDEND) {
            if (nums[st.cur]) { nums[st.cur].visible = false; nums[st.cur].scale.set(1, 1, 1); }
            st.cur = 0;
            hb.visible = true;
            hb.scale.set(0.4, 0.4, 0.4);
            hb.material.opacity = 1;
        } else if (fr >= CDEND && fr < HBFADE) {
            var t_ = fr - CDEND;
            var sc = 1, op = 1;
            if (t_ < 10) {
                var p = t_ / 10;
                sc = 0.4 + 0.6 * (1 - Math.pow(1 - p, 3));
            } else if (t_ < 45) {
                sc = 1 + 0.03 * Math.sin((t_ - 10) * 0.3);
            } else {
                var p2 = Math.min(1, (t_ - 45) / 20);
                sc = 1 + 1.5 * Math.pow(p2, 1.6);
                op = Math.max(0, 1 - p2);
            }
            hb.scale.set(sc, sc, sc);
            hb.material.opacity = op;
        }

        if (fr === HBFADE) {
            hb.visible = false;
            confetti.visible = true;
            ribbons.forEach(function (r) {
                r.act = true;
                r.bf = fr;
                r.mesh.visible = true;
                r.mesh.position.set(r.pos[0], r.pos[1], r.pos[2]);
                eul.set(r.o[0] * Math.PI / 180, r.o[1] * Math.PI / 180, r.o[2] * Math.PI / 180);
                r.mesh.quaternion.setFromEuler(eul);
            });
            fall = true; bstart = true;
        }

        if (fr === CAKEEF) {
            cake.visible = true;
            candleGroup.visible = bstart;
            rot = true;
        }

        if (bstart) {
            var ph = fr * FDELAY;
            for (var fi = 0; fi < flames.length; fi++) {
                var fl = flames[fi];
                var inner = fl.zOff > 0;
                deform(fl, inner ? 1 + 0.14 * Math.sin(ph * 4.3 + 1) : 1 + 0.10 * Math.sin(ph * 3.1),
                    0.01 * Math.sin(ph * 2.3 + fi), 0.01 * Math.cos(ph * 1.7 + fi), inner ? 0.008 : 0);
            }
        }

        if (fall) {
            for (i = 0; i < NC; i++) {
                cfPos[i * 3] += cfVel[i * 3];
                cfPos[i * 3 + 1] += cfVel[i * 3 + 1];
                cfPos[i * 3 + 2] += cfVel[i * 3 + 2];
                if (cfPos[i * 3 + 2] < CBOT || Math.abs(cfPos[i * 3]) > 6 || Math.abs(cfPos[i * 3 + 1]) > 6) {
                    cfPos[i * 3] = (crng() * 2 - 1) * 5;
                    cfPos[i * 3 + 1] = (crng() * 2 - 1) * 5;
                    cfPos[i * 3 + 2] = CTOP;
                    cfVel[i * 3 + 2] = -(0.08 + crng() * 0.10);
                }
            }
            confetti.geometry.attributes.position.needsUpdate = true;
        }

        for (i = 0; i < ribbons.length; i++) {
            var r2 = ribbons[i];
            if (!r2.act) continue;
            var age2 = fr - r2.bf;
            if (age2 > BLIFE * 3) { r2.act = false; r2.mesh.visible = false; continue; }
            r2.v[2] -= GRAV;
            r2.pos[0] += r2.v[0]; r2.pos[1] += r2.v[1]; r2.pos[2] += r2.v[2];
            for (var a = 0; a < 3; a++) r2.o[a] += r2.rs[a] * RSPD * 0.1;
            r2.mesh.position.set(r2.pos[0], r2.pos[1], r2.pos[2]);
            eul.set(r2.o[0] * Math.PI / 180, r2.o[1] * Math.PI / 180, r2.o[2] * Math.PI / 180);
            r2.mesh.quaternion.setFromEuler(eul);
        }

        dec.update(fr / 30);
        met.update();
        sky.update(fr / 30);
        tiles.update(fr / 30);

        pointer.smooth(0.08);
        var nx = pointer.p.x, ny = pointer.p.y;
        parallax(camBase, camera, nx, ny, 0.45);
        camera.updateMatrixWorld();

        if (rot) scene.rotation.z += 0.002;
        leanV.set(0, 0, 0).addScaledVector(camBase.right, nx * 0.5).addScaledVector(camBase.up, ny * 0.38);
        var lax = -leanV.y / (tz + 0.35), lay = leanV.x / (tz + 0.35);
        var csz = Math.cos(scene.rotation.z), snz = Math.sin(scene.rotation.z);
        cake.rotation.set(lax * csz + lay * snz, -lax * snz + lay * csz, 0);
        candleGroup.rotation.copy(cake.rotation);
        scene.updateMatrixWorld(true);
        interact.apply(pointer.p.has, nx, ny);
    }

    var raf = 0, running = false, prev = 0, acc = 0;
    var STEP = 1000 / 30;

    function loop(ts) {
        if (!running) return;
        if (!prev) prev = ts || 0;
        acc += (ts || 0) - prev;
        prev = ts || 0;
        var steps = Math.min(3, Math.floor(acc / STEP));
        for (var i = 0; i < steps; i++) tick();
        acc -= steps * STEP;
        resize();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
    }

    var resize = makeResize(stage, renderer, camera, pr);

    function onKey(e) {
        if (e.code !== 'Space') return;
        var t = e.target;
        var tag = t && t.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        reset();
    }

    setCam();
    hideAll();
    window.addEventListener('keydown', onKey);
    running = true;
    raf = requestAnimationFrame(loop);

    return {
        destroy: function () {
            running = false;
            cancelAnimationFrame(raf);
            window.removeEventListener('keydown', onKey);
            pointer.detach();
            renderer.dispose();
            if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
        },
        reset: reset
    };
}

var SPAL = ['#FFE9A8', '#FFD98A', '#F6C766', '#FFF6D0', '#E8B25C', '#FFCE7A'];
var STARPAL = ['#FF6FA5', '#FFB35C', '#FFE066', '#5FD9C0', '#6FA8FF', '#B98CE0', '#FF8FE8', '#FFFFFF', '#8FE3FF'];
var STARK = 0.08;
var SRBPAL = ['#7FB2E5', '#FFD98A', '#8FD6C4', '#F48FB1', '#CFE0FF', '#FFE9A8'];
var SKY_RGB = [16 / 255, 23 / 255, 54 / 255];
var RBPAL = ['#B39DDB', '#F48FB1', '#FFCE7A', '#7FCFB6', '#C7A8E8', '#FF85B8', '#F06292'];
var SCZ = 2.6;

function starVerts(R, k) {
    var v = [];
    for (var i = 0; i < 10; i++) {
        var rr = (i % 2 === 0) ? R : R * k;
        var a = Math.PI / 2 - i * Math.PI / 5;
        v.push([rr * Math.cos(a), rr * Math.sin(a)]);
    }
    return v;
}

function starSprite() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var V = starVerts(29, 0.44);
    g.beginPath();
    g.moveTo(32 + V[0][0], 32 - V[0][1]);
    for (var i = 1; i < 10; i++) g.lineTo(32 + V[i][0], 32 - V[i][1]);
    g.closePath();
    var grad = g.createRadialGradient(32, 32, 1, 32, 32, 29);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.72, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0.82)');
    g.fillStyle = grad;
    g.fill();
    var t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
}

function ribbonTexture(angle) {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    g.translate(32, 32);
    g.rotate(angle);
    g.translate(-32, -32);
    var grad = g.createLinearGradient(4, 0, 60, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.3, 'rgba(255,255,255,1)');
    grad.addColorStop(0.7, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(4, 23, 56, 18);
    var t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
}

function makeRibbons(rnd, cfg) {
    var tex = [ribbonTexture(0.2), ribbonTexture(1.25), ribbonTexture(-1.1)];
    var systems = [];
    for (var s = 0; s < 3; s++) {
        var n = cfg.n;
        var pos = new Float32Array(n * 3);
        var col = new Float32Array(n * 3);
        var vel = new Float32Array(n);
        var phy = new Float32Array(n);
        for (var i = 0; i < n; i++) {
            pos[i * 3] = (rnd() * 2 - 1) * cfg.box.x;
            pos[i * 3 + 1] = (rnd() * 2 - 1) * cfg.box.y;
            pos[i * 3 + 2] = cfg.box.z0 + rnd() * (cfg.box.z1 - cfg.box.z0);
            var c = lighter(hexRGB(cfg.pal[Math.floor(rnd() * cfg.pal.length)]), rnd() * 0.18);
            col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
            vel[i] = cfg.speed[0] + rnd() * (cfg.speed[1] - cfg.speed[0]);
            phy[i] = rnd() * Math.PI * 2;
        }
        var pts = makePoints(new Float32Array(pos), col, cfg.size, tex[s], false);
        pts.material.opacity = cfg.opacity;
        systems.push({ pts: pts, base: pos, vel: vel, ph: phy });
    }
    return {
        items: systems,
        add: function (scene) { systems.forEach(function (sy) { scene.add(sy.pts); }); },
        update: function (t) {
            for (var s = 0; s < systems.length; s++) {
                var sy = systems[s], p = sy.base;
                for (var i = 0; i < sy.vel.length; i++) {
                    p[i * 3 + 2] -= sy.vel[i];
                    p[i * 3] += Math.sin(t * 1.4 + sy.ph[i]) * 0.007;
                    if (p[i * 3 + 2] < cfg.box.z0) {
                        p[i * 3 + 2] = cfg.box.z1;
                        p[i * 3] = (Math.random() * 2 - 1) * cfg.box.x;
                        p[i * 3 + 1] = (Math.random() * 2 - 1) * cfg.box.y;
                    }
                }
            }
        }
    };
}

function makeMeteors(rnd, cfg) {
    var total = cfg.n * cfg.tail;
    var tPos = new Float32Array(total * 3);
    var tCol = new Float32Array(total * 3);
    var list = [];
    var headPos = new Float32Array(cfg.n * 3);
    var headCol = new Float32Array(cfg.n * 3);

    function paint(st) {
        for (var q = 0; q < cfg.tail; q++) {
            var k = Math.pow(q / (cfg.tail - 1), 0.55);
            var f = mixRgb(st.rgb, cfg.fade, k);
            var o = st.base + q * 3;
            tCol[o] = f[0]; tCol[o + 1] = f[1]; tCol[o + 2] = f[2];
        }
        st.line.geometry.attributes.color.needsUpdate = true;
    }

    function spawn(st, scatter) {
        st.org[0] = (rnd() * 2 - 1) * cfg.box.x;
        st.org[1] = (rnd() * 2 - 1) * cfg.box.y;
        st.org[2] = cfg.box.z1;
        var ax = (rnd() * 2 - 1) * 0.85;
        var ay = (rnd() * 2 - 1) * 0.3;
        var az = -(0.75 + rnd() * 0.5);
        var n = Math.sqrt(ax * ax + ay * ay + az * az);
        st.dir[0] = ax / n; st.dir[1] = ay / n; st.dir[2] = az / n;
        st.spd = cfg.speed[0] + rnd() * (cfg.speed[1] - cfg.speed[0]);
        st.t = scatter ? rnd() * (cfg.box.z1 - cfg.box.z0) * 1.4 : 0;
        st.rgb = hexRGB(cfg.pal[Math.floor(rnd() * cfg.pal.length)]);
        headCol[st.idx * 3] = st.rgb[0]; headCol[st.idx * 3 + 1] = st.rgb[1]; headCol[st.idx * 3 + 2] = st.rgb[2];
        paint(st);
    }

    for (var m = 0; m < cfg.n; m++) {
        var base = m * cfg.tail * 3;
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(tPos.subarray(base, base + cfg.tail * 3), 3));
        geo.setAttribute('color', new THREE.BufferAttribute(tCol.subarray(base, base + cfg.tail * 3), 3));
        var line = new THREE.Line(geo, new THREE.LineBasicMaterial({
            vertexColors: true, transparent: true, opacity: 0.9
        }));
        line.frustumCulled = false;
        var st = { line: line, base: base, idx: m, org: [0, 0, 0], dir: [0, 0, -1], spd: 0, t: 0, rgb: [1, 1, 1] };
        spawn(st, true);
        list.push(st);
    }
    var heads = makePoints(headPos, headCol, cfg.headSize, sphereTexture(), false);
    heads.material.opacity = 0.9;
    var tails = makePoints(tPos, tCol, cfg.tailDot, sphereTexture(), false);
    tails.material.opacity = 0.75;

    return {
        add: function (scene) {
            list.forEach(function (st) { scene.add(st.line); });
            scene.add(tails);
            scene.add(heads);
        },
        update: function () {
            for (var m = 0; m < list.length; m++) {
                var st = list[m];
                st.t += st.spd;
                var hx = st.org[0] + st.dir[0] * st.t;
                var hy = st.org[1] + st.dir[1] * st.t;
                var hz = st.org[2] + st.dir[2] * st.t;
                if (hz < cfg.box.z0 || Math.abs(hx) > cfg.box.x + 1.5) {
                    spawn(st, false);
                    hx = st.org[0]; hy = st.org[1]; hz = st.org[2];
                }
                headPos[m * 3] = hx; headPos[m * 3 + 1] = hy; headPos[m * 3 + 2] = hz;
                for (var q = 0; q < cfg.tail; q++) {
                    var back = q * cfg.seg;
                    var o = st.base + q * 3;
                    tPos[o] = hx - st.dir[0] * back;
                    tPos[o + 1] = hy - st.dir[1] * back;
                    tPos[o + 2] = hz - st.dir[2] * back;
                }
                st.line.geometry.attributes.position.needsUpdate = true;
            }
            tails.geometry.attributes.position.needsUpdate = true;
            heads.geometry.attributes.position.needsUpdate = true;
            heads.geometry.attributes.color.needsUpdate = true;
        }
    };
}

function makeStarfield(rnd, cfg) {
    var groups = [];
    for (var g = 0; g < cfg.sizes.length; g++) {
        var n = cfg.n;
        var pos = new Float32Array(n * 3);
        var col = new Float32Array(n * 3);
        for (var i = 0; i < n; i++) {
            pos[i * 3] = (rnd() * 2 - 1) * cfg.box.x;
            pos[i * 3 + 1] = (rnd() * 2 - 1) * cfg.box.y;
            pos[i * 3 + 2] = cfg.box.z0 + rnd() * (cfg.box.z1 - cfg.box.z0);
            var c = lighter(hexRGB(cfg.pal[Math.floor(rnd() * cfg.pal.length)]), rnd() * STARK);
            col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
        }
        var pts = makePoints(new Float32Array(pos), col, cfg.sizes[g], cfg.sprite, false);
        pts.material.opacity = cfg.opacity;
        groups.push({ pts: pts, base: pos, op: cfg.opacity, ph: g * 1.9, rate: 0.5 + g * 0.27 });
    }
    return {
        items: groups,
        add: function (scene) {
            groups.forEach(function (gr) { scene.add(gr.pts); });
        },
        update: function (t) {
            for (var g = 0; g < groups.length; g++) {
                var gr = groups[g];
                gr.pts.material.opacity = gr.op * (0.62 + 0.38 * Math.sin(t * gr.rate + gr.ph));
                gr.pts.position.x = Math.sin(t * 0.12 + gr.ph) * 0.18;
            }
        }
    };
}

function buildStar(stage, opts) {
    var rnd = mulberry(randSeed());
    var sprite = sphereTexture();

    // 手机 GPU 上关掉抗锯齿、把像素比压到 1.5，点云动画才不会掉帧
    var renderer = new THREE.WebGLRenderer({ antialias: !compactViewport(), alpha: true });
    var pr = Math.min(window.devicePixelRatio || 1, compactViewport() ? 1.5 : 2);
    renderer.setPixelRatio(pr);
    renderer.domElement.className = 'cake-canvas';
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
    camera.position.set(0, -7.2, SCZ);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, SCZ);

    var motes = null;
    var GN = Math.round(1500 + rnd() * 700);
    var gPos = new Float32Array(GN * 3);
    var gCol = new Float32Array(GN * 3);
    var gVel = new Float32Array(GN);
    for (var i = 0; i < GN; i++) {
        gPos[i * 3] = (rnd() * 2 - 1) * 5.9;
        gPos[i * 3 + 1] = (rnd() * 2 - 1) * 2.2;
        gPos[i * 3 + 2] = SCZ + (rnd() * 2 - 1) * 3.4;
        var gc = lighter(hexRGB(STARPAL[Math.floor(rnd() * STARPAL.length)]), STARK);
        gCol[i * 3] = gc[0]; gCol[i * 3 + 1] = gc[1]; gCol[i * 3 + 2] = gc[2];
        gVel[i] = 0.004 + rnd() * 0.012;
    }
    motes = makePoints(new Float32Array(gPos), gCol, 3.2, sprite, false);
    motes.material.opacity = 0.7;
    scene.add(motes);

    var jit = 0.85 + rnd() * 0.3;
    var dec = makeRibbons(rnd, {
        n: Math.round(210 + rnd() * 110), size: 11, opacity: 0.95,
        speed: [0.014, 0.034], pal: SRBPAL,
        box: { x: 5.9 * jit, y: 1.8, z0: SCZ - 3.4, z1: SCZ + 3.4 }
    });
    dec.add(scene);

    var met = makeMeteors(rnd, {
        n: 3 + Math.floor(rnd() * 3), tail: 18, seg: 0.08, headSize: 9, tailDot: 5,
        speed: [0.09, 0.16], pal: SPAL, fade: SKY_RGB,
        box: { x: 6.2 * jit, y: 1.6, z0: SCZ - 3.8, z1: SCZ + 3.9 }
    });
    met.add(scene);

    var sky = makeStarfield(rnd, {
        n: Math.round(380 + rnd() * 170), sizes: [4, 5.2, 6.8], opacity: 0.9,
        sprite: sprite, pal: STARPAL,
        box: { x: 6.4 * jit, y: 2.6 * jit, z0: SCZ - 3.6, z1: SCZ + 3.6 }
    });
    sky.add(scene);

    var tiles = makeStarfield(rnd, {
        n: Math.round(100 + rnd() * 60), sizes: [16, 24, 34], opacity: 0.95,
        sprite: starSprite(), pal: STARPAL,
        box: { x: 6.4 * jit, y: 2.6 * jit, z0: SCZ - 3.6, z1: SCZ + 3.6 }
    });
    tiles.add(scene);

    var interact = makeInteract(camera);
    var pointer = makePointer(stage);
    function reg(sys, r, s) {
        sys.items.forEach(function (it) { interact.add(it.pts, it.base, r, s); });
    }
    interact.add(motes, gPos, 1.4, 1.05);
    reg(dec, 1.2, 1.1);
    reg(sky, 1.5, 0.95);
    reg(tiles, 1.7, 1.3);

    var camBase = { pos: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), tmp: new THREE.Vector3(), tgt: new THREE.Vector3(0, 0, SCZ) };
    captureCam(camera, camBase);

    var frame = 0;
    var running = false, raf = 0, prev = 0, acc = 0;
    var STEP = 1000 / 30;
    var resize = makeResize(stage, renderer, camera, pr);

    function tick() {
        frame += 1;
        var t = frame / 30;

        for (var k = 0; k < GN; k++) {
            gPos[k * 3 + 2] += gVel[k];
            if (gPos[k * 3 + 2] > SCZ + 3.4) gPos[k * 3 + 2] = SCZ - 3.4;
        }

        dec.update(t);
        met.update();
        sky.update(t);
        tiles.update(t);

        pointer.smooth(0.08);
        var nx = pointer.p.x, ny = pointer.p.y;
        parallax(camBase, camera, nx, ny, 0.5);
        camera.updateMatrixWorld();
        scene.updateMatrixWorld(true);
        interact.apply(pointer.p.has, nx, ny);
    }

    function loop(ts) {
        if (!running) return;
        if (!prev) prev = ts || 0;
        acc += (ts || 0) - prev;
        prev = ts || 0;
        var steps = Math.min(3, Math.floor(acc / STEP));
        for (var i = 0; i < steps; i++) tick();
        acc -= steps * STEP;
        resize();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
    }

    running = true;
    raf = requestAnimationFrame(loop);

    return {
        destroy: function () {
            running = false;
            cancelAnimationFrame(raf);
            pointer.detach();
            renderer.dispose();
            if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
        }
    };
}


export function mount(stage, opts) {
    opts = opts || {};
    try {
        return opts.scene === 'star' ? buildStar(stage, opts) : build(stage, opts);
    } catch (e) {
        return null;
    }
}
