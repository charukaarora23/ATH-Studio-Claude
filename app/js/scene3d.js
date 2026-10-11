/* Studio3D: the 3D folders (Three.js r149, vendored in vendor/three.min.js).
   Two scenes: a shelf of three folders on the home page, and a single folder beside the questions.
   Decorative only: every action here also exists as a normal button in the page, and the canvas is aria-hidden. */
(function (root) {
  'use strict';
  const T = root.THREE;

  function supported() {
    if (!T) return false;
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }

  /* ---------- shared materials ---------- */
  let grainTex = null;
  function grain() {
    if (grainTex) return grainTex;
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = 118 + Math.random() * 20; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
    grainTex = new T.CanvasTexture(c); grainTex.wrapS = grainTex.wrapT = T.RepeatWrapping; grainTex.repeat.set(3, 3);
    return grainTex;
  }
  const mat = (color, rough = 0.78) => new T.MeshStandardMaterial({ color: new T.Color(color), roughness: rough, metalness: 0, bumpMap: grain(), bumpScale: 0.0025 });
  const shade = (hex, k) => { const c = new T.Color(hex); c.multiplyScalar(k); return c; };

  /* ---------- folder geometry (units: 1 = ~a forearm, folder is 2 x 1.5) ---------- */
  const FW = 2.0, FH = 1.5, DEPTH = 0.024;
  const extrude = (shape) => new T.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 18 });

  function backShape(tabX, tabW, tabH = 0.2, r = 0.07) {
    const s = new T.Shape(); const sh = 0.07; // shoulder run
    s.moveTo(r, 0); s.lineTo(FW - r, 0); s.quadraticCurveTo(FW, 0, FW, r);
    s.lineTo(FW, FH - r); s.quadraticCurveTo(FW, FH, FW - r, FH);
    s.lineTo(tabX + tabW + sh, FH);
    s.bezierCurveTo(tabX + tabW + 0.02, FH, tabX + tabW + 0.02, FH + tabH, tabX + tabW - 0.05, FH + tabH);
    s.lineTo(tabX + 0.05, FH + tabH);
    s.bezierCurveTo(tabX - 0.02, FH + tabH, tabX - 0.02, FH, tabX - sh, FH);
    s.lineTo(r, FH); s.quadraticCurveTo(0, FH, 0, FH - r);
    s.lineTo(0, r); s.quadraticCurveTo(0, 0, r, 0);
    return s;
  }
  function frontShape(h, r = 0.07) {
    const s = new T.Shape(); const cx = FW * 0.5, cw = 0.42, cd = 0.09; const rt = 0.03;
    s.moveTo(r, 0); s.lineTo(FW - r, 0); s.quadraticCurveTo(FW, 0, FW, r);
    s.lineTo(FW, h - rt); s.quadraticCurveTo(FW, h, FW - rt, h);
    s.lineTo(cx + cw / 2, h);
    s.bezierCurveTo(cx + cw * 0.22, h, cx + cw * 0.3, h - cd, cx, h - cd);
    s.bezierCurveTo(cx - cw * 0.3, h - cd, cx - cw * 0.22, h, cx - cw / 2, h);
    s.lineTo(rt, h); s.quadraticCurveTo(0, h, 0, h - rt);
    s.lineTo(0, r); s.quadraticCurveTo(0, 0, r, 0);
    return s;
  }
  function labelTexture(text, sub, ink) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = ink; g.textBaseline = 'alphabetic';
    g.font = '600 170px "Hanken Grotesk", system-ui, sans-serif'; g.fillText(text, 60, 440);
    const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
  }

  /* A folder is: back board with tab, a stack of sheets, and a front cover hinged at the bottom. */
  function makeFolder(o) {
    const group = new T.Group(); const body = new T.Group(); group.add(body);
    const tabW = 0.62; const tabX = o.tabX != null ? o.tabX : 0.16;
    const back = new T.Mesh(extrude(backShape(tabX, tabW)), mat(shade(o.color, o.backShade || 0.82)));
    back.castShadow = true; back.receiveShadow = true; body.add(back);

    const sheets = new T.Group(); sheets.position.z = DEPTH + 0.016; body.add(sheets);
    const sheetGeo = new T.BoxGeometry(FW - 0.16, FH * 0.9, 0.005);
    const paperMats = [mat('#FFFDF9', 0.9), mat(o.tint, 0.9)];
    function addSheet(i, animate) {
      const m = new T.Mesh(sheetGeo, paperMats[i % 2]);
      const x = FW / 2 + (Math.sin(i * 12.9) * 0.025); const y = FH * 0.45 + 0.02 + (i % 3) * 0.012;
      m.position.set(x, y, i * 0.009); m.rotation.z = Math.sin(i * 7.3) * 0.018;
      m.castShadow = true; m.receiveShadow = true; m.userData.rest = y;
      if (animate) { m.position.y = y + 1.6; m.userData.drop = 0; }
      sheets.add(m); return m;
    }

    const hinge = new T.Group(); hinge.position.set(0, 0, DEPTH + 0.075); body.add(hinge);
    const fh = FH * 0.78;
    const front = new T.Mesh(extrude(frontShape(fh)), mat(o.color, 0.72)); front.castShadow = true; front.receiveShadow = true; hinge.add(front);
    // the label sits on the cover like a printed word
    const lab = new T.Mesh(new T.PlaneGeometry(1.2, 0.6), new T.MeshBasicMaterial({ map: labelTexture(o.label, o.sub, o.ink), transparent: true, depthWrite: false }));
    lab.position.set(0.68, 0.38, DEPTH + 0.0075); hinge.add(lab);
    o.labelMesh = lab;

    const state = { lift: 0, liftT: 0, open: 0.06, openT: 0.06, bob: Math.random() * 6 };
    group.userData = { key: o.key, body, hinge, sheets, addSheet, state, lab, opts: o };
    body.position.x = -FW / 2;
    return group;
  }
  function setSheetCount(f, n, animate) {
    const { sheets, addSheet } = f.userData; n = Math.max(1, Math.min(7, n));
    while (sheets.children.length < n) addSheet(sheets.children.length, animate);
    while (sheets.children.length > n) sheets.remove(sheets.children[sheets.children.length - 1]);
  }
  function relabel(f, text, sub) {
    const o = f.userData.opts; const m = f.userData.lab.material; if (m.map) m.map.dispose();
    m.map = labelTexture(text, sub, o.ink); m.needsUpdate = true;
  }

  /* ---------- scene shell ---------- */
  function shell(canvas, o) {
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(); const camera = new T.PerspectiveCamera(o.fov || 30, 1, 0.1, 100);
    const hemi = new T.HemisphereLight(0xFFFFFF, 0xB59A92, 1.0); scene.add(hemi);
    const key = new T.DirectionalLight(0xFFF4EA, 0.55); key.position.set(-2.5, 9, 6); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 14; key.shadow.blurSamples = 16; key.shadow.bias = -0.0004;
    Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 20 }); scene.add(key);
    const rim = new T.DirectionalLight(0xFFD6DE, 0.0); rim.position.set(-4, 3, -3); scene.add(rim);
    const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: 0.12 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const world = new T.Group(); scene.add(world);
    let raf = 0; let visible = true; let alive = true; let tick = null;
    function size() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); o.onResize && o.onResize(w / h); }
    const ro = new ResizeObserver(size); ro.observe(canvas);
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) loop(); }); io.observe(canvas);
    function loop() { cancelAnimationFrame(raf); if (!alive || !visible || document.hidden) return; raf = requestAnimationFrame((t) => { tick && tick(t / 1000); renderer.render(scene, camera); loop(); }); }
    const onVis = () => loop(); document.addEventListener('visibilitychange', onVis);
    function setTheme(dark) { floor.material.opacity = dark ? 0.38 : 0.12; hemi.groundColor.set(dark ? 0x4A2A30 : 0xB59A92); hemi.intensity = dark ? 0.85 : 1.0; rim.intensity = dark ? 0.55 : 0; }
    function destroy() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis);
      scene.traverse((n) => { if (n.geometry) n.geometry.dispose(); if (n.material) { [].concat(n.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); } });
      renderer.dispose();
    }
    size();
    return { renderer, scene, camera, world, setTheme, destroy, start(fn) { tick = fn; loop(); }, size };
  }
  const lerp = (a, b, k) => a + (b - a) * k;
  const damp = (k, dt) => 1 - Math.pow(1 - k, dt * 60);

  /* ---------- home: a shelf of three folders ---------- */
  function shelf(canvas, o) {
    let folders = []; let ready = false;
    const S = shell(canvas, { fov: 28, onResize: (a) => ready && layout(a) });
    const ray = new T.Raycaster(); const ptr = new T.Vector2(9, 9); const par = { x: 0, y: 0, tx: 0, ty: 0 };
    const tabXs = [0.16, 0.69, 1.22];
    folders = o.folders.map((f, i) => { const g = makeFolder({ ...f, tabX: tabXs[i] }); setSheetCount(g, Math.min(6, Math.max(2, f.count + 1))); S.world.add(g); return g; });
    let hot = null; let opening = null; const cam = { x: 0, y: 1.5, z: 11, tx: 0, ty: 1.5, tz: 11, lx: 0, ly: 0.92 };
    function layout(aspect) {
      const wide = aspect > 1.25;
      const xs = wide ? [-2.55, 0, 2.55] : [-1.0, 0, 1.0]; const zs = wide ? [0, 0.25, 0] : [-0.8, 0.3, -0.8]; const ry = wide ? [0.22, 0, -0.22] : [0.5, 0, -0.5];
      folders.forEach((f, i) => { f.position.set(xs[i], 0, zs[i]); f.rotation.y = ry[i]; f.userData.ry = ry[i]; f.rotation.x = -0.06; });
      const span = wide ? 7.6 : 3.9; const vf = T.MathUtils.degToRad(S.camera.fov); const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
      const dist = Math.max((span / 2) / Math.tan(hf / 2), (2.4 / 2) / Math.tan(vf / 2)) + 1.2;
      cam.tz = dist; cam.ty = 1.2 + dist * 0.16; if (!opening) { cam.z = cam.tz; cam.y = cam.ty; }
    }
    ready = true; layout(canvas.clientWidth / Math.max(1, canvas.clientHeight));
    function pick(e) { const r = canvas.getBoundingClientRect(); ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1; par.tx = ptr.x; par.ty = ptr.y; }
    function hit() { ray.setFromCamera(ptr, S.camera); const h = ray.intersectObjects(folders, true)[0]; if (!h) return null; let n = h.object; while (n && !n.userData.key) n = n.parent; return n ? n.userData.key : null; }
    const onMove = (e) => { pick(e); const k = hit(); if (k !== hot) { hot = k; canvas.style.cursor = k ? 'pointer' : 'default'; o.onHover && o.onHover(k); } };
    const onLeave = () => { ptr.set(9, 9); par.tx = par.ty = 0; if (hot) { hot = null; o.onHover && o.onHover(null); } };
    const onClick = (e) => { pick(e); const k = hit(); if (k) o.onOpen && o.onOpen(k); };
    canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave); canvas.addEventListener('click', onClick);
    let last = 0;
    S.start((t) => {
      const dt = Math.min(0.05, last ? t - last : 0.016); last = t; const still = !o.motion();
      const k = still ? 1 : damp(0.12, dt);
      par.x = lerp(par.x, still ? 0 : par.tx, k); par.y = lerp(par.y, still ? 0 : par.ty, k);
      S.world.rotation.y = par.x * 0.07; S.world.rotation.x = -par.y * 0.025;
      folders.forEach((f) => {
        const st = f.userData.state; const isHot = hot === f.userData.key || o.focus() === f.userData.key;
        st.liftT = isHot ? 1 : 0; if (opening !== f) st.openT = isHot ? 0.62 : 0.06;
        st.lift = lerp(st.lift, st.liftT, k); st.open = lerp(st.open, st.openT, still ? 1 : damp(0.1, dt));
        f.userData.body.position.y = st.lift * 0.2 + (still ? 0 : Math.sin(t * 0.9 + st.bob) * 0.012);
        f.userData.hinge.rotation.x = st.open;
        f.userData.sheets.children.forEach((s, i, a) => { s.position.y = s.userData.rest + st.lift * 0.14 * (i + 1) / a.length; });
        f.rotation.y = f.userData.ry * (1 - st.lift * 0.6);
      });
      cam.x = lerp(cam.x, cam.tx, k); cam.y = lerp(cam.y, cam.ty, k); cam.z = lerp(cam.z, cam.tz, still ? 1 : damp(0.08, dt));
      S.camera.position.set(cam.x, cam.y, cam.z); S.camera.lookAt(cam.lx, cam.ly, 0);
    });
    return {
      setTheme: S.setTheme,
      open(key) {
        const f = folders.find((g) => g.userData.key === key); if (!f) return Promise.resolve();
        opening = f; f.userData.state.openT = 1.25; hot = key;
        cam.tx = f.position.x * 0.9; cam.ty = 1.4; cam.tz = Math.max(3.6, cam.tz * 0.45); cam.lx = f.position.x * 0.9;
        return new Promise((r) => setTimeout(r, o.motion() ? 620 : 0));
      },
      destroy() { canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('click', onClick); S.destroy(); },
    };
  }

  /* ---------- writing view: one folder you can turn ---------- */
  function single(canvas, o) {
    const S = shell(canvas, { fov: 30 });
    const f = makeFolder({ ...o, tabX: o.tabX ?? 0.16 }); S.world.add(f); setSheetCount(f, o.sheets || 1);
    f.rotation.x = -0.05;
    const rest = -0.26; let ry = rest, vy = 0, dragging = false, lx = 0; let hop = 0; let hopT = 0;
    const onDown = (e) => { dragging = true; lx = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e) => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; ry += dx * 0.012; vy = dx * 0.012; };
    const onUp = () => { dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    let last = 0;
    S.camera.position.set(0, 1.55, 5.3); S.camera.lookAt(0, 0.78, 0);
    S.start((t) => {
      const dt = Math.min(0.05, last ? t - last : 0.016); last = t; const still = !o.motion();
      if (!dragging) { vy *= 0.9; ry += vy; ry = lerp(ry, rest + (still ? 0 : Math.sin(t * 0.5) * 0.06), still ? 1 : damp(0.04, dt)); }
      f.rotation.y = ry;
      const st = f.userData.state; st.open = lerp(st.open, st.openT, still ? 1 : damp(0.1, dt)); f.userData.hinge.rotation.x = st.open;
      hop = lerp(hop, hopT, still ? 1 : damp(0.18, dt)); f.userData.body.position.y = hop * 0.18;
      f.userData.sheets.children.forEach((s) => { if (s.userData.drop != null) { s.position.y = lerp(s.position.y, s.userData.rest, still ? 1 : damp(0.09, dt)); if (Math.abs(s.position.y - s.userData.rest) < 0.002) { s.position.y = s.userData.rest; delete s.userData.drop; } } });
    });
    const api = {
      setTheme: S.setTheme,
      setSheets(n) { setSheetCount(f, n, o.motion()); },
      peek(on) { f.userData.state.openT = on ? 0.5 : 0.18; },
      relabel(text, sub) { relabel(f, text, sub); },
      async file() {
        const m = o.motion(); const st = f.userData.state;
        st.openT = 0.9; await wait(m ? 260 : 0);
        setSheetCount(f, f.userData.sheets.children.length + 1, m); await wait(m ? 520 : 0);
        st.openT = 0.0; await wait(m ? 260 : 0);
        hopT = 1; await wait(m ? 140 : 0); hopT = 0; await wait(m ? 200 : 0);
        st.openT = 0.18;
      },
      destroy() { canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); S.destroy(); },
    };
    f.userData.state.openT = 0.18;
    return api;
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  root.Studio3D = { supported, shelf, single };
})(window);
