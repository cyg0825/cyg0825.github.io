import * as THREE from './js/three.module.js';

var LAYERS = [
    [1.90, 0.85, '#FFB3C6'],
    [1.36, 0.72, '#FF6B9D'],
    [0.88, 0.60, '#D9BFFF']
];
var PLATE_COLOR = '#E7DCF2';
var CANDLE_COLOR = '#FF8FA3';
var FLAME_OUTER = '#FF4A0F';
var FLAME_INNER = '#FFE9A8';
var HB_COLOR = '#FF69B4';
var SPCOL = ['#FF8FA3', '#7EC8E3', '#FFC857', '#9AE6B4', '#C79BFF', '#FFFFFF'];
var RPAL = ['#FF1744', '#FF6D00', '#FFD600', '#76FF03', '#00E5FF', '#2979FF', '#AA00FF', '#F50057',
    '#00E676', '#FF9100', '#FF4081', '#18FFFF', '#FFFF00', '#FF6E40', '#B388FF', '#69F0AE'];
var CPAL = ['#FF6B9D', '#FFD93D', '#6BCB7F', '#A0E76E', '#C78CFF', '#FF9A6B', '#FF1744', '#00E5FF'];
var NCOL = { 3: '#F50057', 2: '#FF9100', 1: '#00E676' };

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
var CPOS = [5.3, -5.8, 4.0];
var CTGT = [0.0, 0.0, 1.7];

var PX_TO_WORLD = 0.024;

function px(v) { return v * PX_TO_WORLD; }

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
    g2.addColorStop(0.62, 'rgba(255,255,255,1)');
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
        alphaTest: 0.35,
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

function makePoints(pos, col, size, sprite, opaque) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var pts = new THREE.Points(geo, pointsMat(size, sprite, opaque));
    pts.frustumCulled = false;
    return pts;
}

function sampleCylinder(r, h, z, count, rnd) {
    var pos = new Float32Array(count * 3);
    var col = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
        var th = rnd() * Math.PI * 2;
        var rr = Math.sqrt(rnd()) * r;
        pos[i * 3] = rr * Math.cos(th);
        pos[i * 3 + 1] = rr * Math.sin(th);
        pos[i * 3 + 2] = z + rnd() * h;
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
    var rnd = mulberry(20240601);
    var brng = mulberry(9999);
    var crng = mulberry(7);
    var sprite = sphereTexture();

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    var pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.domElement.className = 'cake-canvas';
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);

    var cake = new THREE.Group();
    var z = 0.0;
    LAYERS.forEach(function (L) {
        var n = 9000;
        var s = sampleCylinder(L[0], L[1], z, n, rnd);
        var c = hexRGB(L[2]);
        for (var i = 0; i < n; i++) fill(s.col, i * 3, c);
        cake.add(makePoints(s.pos, s.col, 1.8, sprite));
        var balls = 26, per = 150;
        var bp = new Float32Array(balls * per * 3);
        var bc = new Float32Array(balls * per * 3);
        var lc = lighter(c, 0.55);
        for (var b = 0; b < balls; b++) {
            var a = 2 * Math.PI * (b + 0.5) / balls;
            var one = sampleEllipsoid(L[0] * 1.03 * Math.cos(a), L[0] * 1.03 * Math.sin(a), z + L[1] - 0.05, 0.10, 0.10, 0.10, per, rnd);
            bp.set(one, b * per * 3);
            for (var k = 0; k < per; k++) fill(bc, (b * per + k) * 3, lc);
        }
        cake.add(makePoints(bp, bc, 1.8, sprite));
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
    cake.add(makePoints(spkPos, spkCol, 1.5, sprite));

    var plateN = 20000;
    var platePos = new Float32Array(plateN * 3);
    var plateCol = new Float32Array(plateN * 3);
    var pc = hexRGB(PLATE_COLOR);
    for (var i = 0; i < plateN; i++) {
        var th = rnd() * 2 * Math.PI;
        var rr = Math.sqrt(rnd()) * 2.2;
        platePos[i * 3] = rr * Math.cos(th);
        platePos[i * 3 + 1] = rr * Math.sin(th);
        platePos[i * 3 + 2] = -0.05 + (rnd() + rnd() + rnd() - 1.5) * 0.012;
        fill(plateCol, i * 3, pc);
    }
    var plate = makePoints(platePos, plateCol, 1.0, sprite);
    plate.material.opacity = 0.32;
    cake.add(plate);
    cake.visible = false;
    scene.add(cake);

    var age = String(opts.age || '18').replace(/\D/g, '').slice(0, 2) || '18';
    var mw = LAYERS[LAYERS.length - 1][0] * 1.03 * 2 * 0.70;
    var candleData = extrudeText(age, { tw: 2.2, fsize: 220, step: 2 }, 0.85, 7000, rnd);
    var scale = candleData.w > mw ? mw / candleData.w : 1;
    var candlePos = candleData.pos.slice();
    for (i = 0; i < candlePos.length; i += 3) {
        candlePos[i] *= scale;
        candlePos[i + 1] *= scale;
    }
    var candleCol = new Float32Array(candlePos.length);
    var cc = hexRGB(CANDLE_COLOR);
    for (i = 0; i < candlePos.length; i += 3) fill(candleCol, i, cc);
    var cMinY = Infinity, cMaxY = -Infinity;
    for (i = 1; i < candlePos.length; i += 3) {
        if (candlePos[i] < cMinY) cMinY = candlePos[i];
        if (candlePos[i] > cMaxY) cMaxY = candlePos[i];
    }
    for (i = 1; i < candlePos.length; i += 3) candlePos[i] -= cMinY;
    var candle = makePoints(candlePos, candleCol, 2, sprite);
    candle.rotation.x = Math.PI / 2;
    candle.position.set(0, 0, tz + 0.02);
    candle.visible = false;
    scene.add(candle);

    var fzTop = tz + 0.02 + (cMaxY - cMinY);
    function flame(count, h, mr, colorHex, zOff) {
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
        mesh.position.set(0, 0, fzTop);
        mesh.visible = false;
        scene.add(mesh);
        return { mesh: mesh, base: base, count: count, zOff: zOff };
    }
    var flameO = flame(5000, 0.30, 0.075, FLAME_OUTER, 0);
    var flameI = flame(3500, 0.22, 0.042, FLAME_INNER, 0.008);

    var nums = {};
    [3, 2, 1].forEach(function (n) {
        var d = extrudeText(String(n), { tw: 2.6, fsize: 260, step: 2 }, 0.5, 7000, rnd);
        var col = new Float32Array(d.pos.length);
        var rgb = hexRGB(NCOL[n]);
        for (var i = 0; i < col.length; i += 3) fill(col, i, rgb);
        var mesh = makePoints(d.pos, col, 2.5, sprite);
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
    var hb = makePoints(hbPos, hbCol, 2.0, sprite);
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
    var confetti = makePoints(cfPos, cfCol, 4, sprite, false);
    confetti.visible = false;
    scene.add(confetti);

    var frame = 0, rot = false, fall = false, bstart = false, st = { nf: -1, cur: 0 };
    var eul = new THREE.Euler();
    var q = new THREE.Quaternion();

    function setCam() {
        var d = [CPOS[0] - CTGT[0], CPOS[1] - CTGT[1], CPOS[2] - CTGT[2]];
        var len = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
        camera.position.set(CTGT[0] + d[0] / len * len, CTGT[1] + d[1] / len * len, CTGT[2] + d[2] / len * len);
        camera.up.set(0, 0, 1);
        camera.lookAt(CTGT[0], CTGT[1], CTGT[2]);
    }

    function hideAll() {
        cake.visible = false;
        candle.visible = false;
        flameO.mesh.visible = false;
        flameI.mesh.visible = false;
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
            candle.visible = bstart;
            flameO.mesh.visible = bstart;
            flameI.mesh.visible = bstart;
            rot = true;
        }

        if (bstart) {
            var ph = fr * FDELAY;
            deform(flameO, 1 + 0.10 * Math.sin(ph * 3.1), 0.01 * Math.sin(ph * 2.3), 0.01 * Math.cos(ph * 1.7), 0);
            deform(flameI, 1 + 0.14 * Math.sin(ph * 4.3 + 1), 0.008 * Math.cos(ph * 2.9), 0.008 * Math.sin(ph * 2.1), 0.008);
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

        if (rot) scene.rotation.z += 0.002;
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

    function resize() {
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
            camera.updateProjectionMatrix();
        }
    }

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
            renderer.dispose();
            if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
        },
        reset: reset
    };
}

export function mount(stage, opts) {
    try {
        return build(stage, opts || {});
    } catch (e) {
        return null;
    }
}
