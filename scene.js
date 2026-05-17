import * as THREE from 'three';

const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 6);

// ───── Lights ─────
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const key = new THREE.DirectionalLight(0xffffff, 1.5);
key.position.set(5, 4, 5);
scene.add(key);
const rim = new THREE.PointLight(0xe4ff3a, 1.6, 10);
rim.position.set(-3, -2, 3);
scene.add(rim);
// Wohin das gelbe Licht hinwandert (folgt dem Cursor)
const rimTarget = new THREE.Vector2(-3, -2);
const fill = new THREE.PointLight(0x6366f1, 1.4, 14);
fill.position.set(3, 2, -2);
scene.add(fill);

// ───── Aperture: echte Logo-Konturen aus brand/logo-shapes.json ─────
// Die Datei enthält 6 Polygone (je eine Lamelle), normiert auf [-1, +1]
// um den Logo-Mittelpunkt. Wir bauen daraus 6 ExtrudeGeometries und
// gruppieren sie. So bleiben die Lücken zwischen den Lamellen erhalten.
const apertureGroup = new THREE.Group();
scene.add(apertureGroup);

const bladeMat = new THREE.MeshPhysicalMaterial({
  color: 0xf6f6f8,
  metalness: 0.55,
  roughness: 0.26,
  clearcoat: 1.0,
  clearcoatRoughness: 0.18,
  reflectivity: 0.8,
});

let blades = [];

async function loadAperture() {
  const res = await fetch('./brand/logo-shapes.json', { cache: 'force-cache' });
  if (!res.ok) {
    console.warn('logo-shapes.json fehlt');
    return;
  }
  const polygons = await res.json();

  polygons.forEach((points) => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][1]);
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
      curveSegments: 12,
    });
    // Tiefe um 0 zentrieren, damit Z-Rotation nicht "schräg" wirkt
    geo.translate(0, 0, -0.07);

    geo.computeBoundingBox();
    const cx = (geo.boundingBox.min.x + geo.boundingBox.max.x) / 2;
    const cy = (geo.boundingBox.min.y + geo.boundingBox.max.y) / 2;
    const angle = Math.atan2(cy, cx);

    const mesh = new THREE.Mesh(geo, bladeMat);
    mesh.userData.angle = angle;
    apertureGroup.add(mesh);
    blades.push(mesh);
  });

  applyApertureScale();
}
loadAperture();

// Logo Größe an Bildschirmverhältnis anpassen: auf Portrait/Mobile
// schrumpft die Blende, damit sie nicht über den ganzen Screen quillt.
function applyApertureScale() {
  const aspect = window.innerWidth / window.innerHeight;
  const scale = Math.min(1.6, Math.max(0.85, aspect * 1.4));
  apertureGroup.scale.setScalar(scale);
}

// ───── Wireframe halo ─────
const haloGeo = new THREE.IcosahedronGeometry(2.6, 1);
const haloMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
  transparent: true,
  opacity: 0.05,
});
const halo = new THREE.Mesh(haloGeo, haloMat);
scene.add(halo);

// ───── Particle field ─────
const pCount = 600;
const positions = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  const r = 4 + Math.random() * 8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi) - 4;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const pMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.018,
  transparent: true,
  opacity: 0.55,
  sizeAttenuation: true,
});
const points = new THREE.Points(pGeo, pMat);
scene.add(points);

// ───── Mouse parallax ─────
const mouse = new THREE.Vector2(0, 0);
const target = new THREE.Vector2(0, 0);
window.addEventListener('pointermove', (e) => {
  target.x = (e.clientX / window.innerWidth) * 2 - 1;
  target.y = -((e.clientY / window.innerHeight) * 2 - 1);
  // Gelb-grünes Rim Licht wandert in die ungefähre Cursor-Richtung,
  // sodass es das Logo aus der Maus-Position heraus anleuchtet.
  rimTarget.x = target.x * 4.5;
  rimTarget.y = target.y * 2.8;
});

// ───── Scroll-driven camera ─────
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
}, { passive: true });

// ───── Resize ─────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  applyApertureScale();
});

// ───── Animation loop ─────
const clock = new THREE.Clock();

function tick() {
  const t = clock.getElapsedTime();

  mouse.x += (target.x - mouse.x) * 0.05;
  mouse.y += (target.y - mouse.y) * 0.05;

  // Gelb-grünes Rim Licht weich an die Cursor-Position annähern
  rim.position.x += (rimTarget.x - rim.position.x) * 0.06;
  rim.position.y += (rimTarget.y - rim.position.y) * 0.06;

  // Logo dreht sich gemächlich, leichte Kippung folgt der Maus
  apertureGroup.rotation.z = t * 0.18;
  apertureGroup.rotation.x = mouse.y * 0.3;
  apertureGroup.rotation.y = mouse.x * 0.4;

  // Subtiles Atmen: jede Lamelle wandert minimal radial nach außen
  const breath = Math.sin(t * 0.6) * 0.04;
  blades.forEach((blade) => {
    const a = blade.userData.angle;
    blade.position.set(Math.cos(a) * breath, Math.sin(a) * breath, 0);
  });

  halo.rotation.x = -t * 0.05;
  halo.rotation.y = t * 0.08;

  points.rotation.y = t * 0.02;
  points.rotation.x = mouse.y * 0.15;

  camera.position.z = 6 + scrollY * 4;
  camera.position.y = -scrollY * 1.2;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
