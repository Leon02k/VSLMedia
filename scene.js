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
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(5, 4, 5);
scene.add(key);
const rim = new THREE.PointLight(0xe4ff3a, 2.2, 14);
rim.position.set(-3, -2, 3);
scene.add(rim);
const fill = new THREE.PointLight(0x6366f1, 1.4, 14);
fill.position.set(3, 2, -2);
scene.add(fill);

// ───── Aperture (Logo als 3D) ─────
// Eine Lamelle als 2D-Shape, danach extrudiert und 6× rotiert um die Z-Achse.
// Form orientiert sich am Logo: außen breit, innen mit gerundeter Spitze
// nahe dem zentralen Loch.
function makeBladeShape() {
  const s = new THREE.Shape();
  s.moveTo(0.18, -0.02);
  s.bezierCurveTo(0.55, 0.02, 0.95, 0.18, 1.15, 0.45);   // obere Kante
  s.bezierCurveTo(1.22, 0.50, 1.22, 0.05, 1.08, -0.10);  // außen gerundete Spitze
  s.bezierCurveTo(0.75, -0.22, 0.40, -0.14, 0.18, -0.02); // untere Kante zurück
  return s;
}

const apertureGroup = new THREE.Group();
const bladeMat = new THREE.MeshPhysicalMaterial({
  color: 0xf3f3f5,
  metalness: 0.45,
  roughness: 0.28,
  clearcoat: 1.0,
  clearcoatRoughness: 0.2,
  reflectivity: 0.7,
  sheen: 0.6,
  sheenRoughness: 0.4,
  sheenColor: 0xcccccc,
});
const bladeGeo = new THREE.ExtrudeGeometry(makeBladeShape(), {
  depth: 0.07,
  bevelEnabled: true,
  bevelThickness: 0.015,
  bevelSize: 0.018,
  bevelOffset: 0,
  bevelSegments: 4,
  curveSegments: 32,
});
bladeGeo.center();

const BLADES = 6;
const blades = [];
for (let i = 0; i < BLADES; i++) {
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  const a = (i / BLADES) * Math.PI * 2;
  blade.userData.angle = a;
  apertureGroup.add(blade);
  blades.push(blade);
}
// Optionale dünne Mittelscheibe — gibt der Mitte mehr Tiefe.
const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 32);
const hub = new THREE.Mesh(hubGeo, bladeMat);
hub.rotation.x = Math.PI / 2;
apertureGroup.add(hub);

apertureGroup.scale.setScalar(0.95);
scene.add(apertureGroup);

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
});

// ───── Animation loop ─────
const clock = new THREE.Clock();

function tick() {
  const t = clock.getElapsedTime();

  mouse.x += (target.x - mouse.x) * 0.05;
  mouse.y += (target.y - mouse.y) * 0.05;

  // Blende dreht sich kontinuierlich, leichte Kippung über Maus
  apertureGroup.rotation.z = t * 0.18;
  apertureGroup.rotation.x = mouse.y * 0.35;
  apertureGroup.rotation.y = mouse.x * 0.45;

  // Atmen: jede Lamelle wandert sanft radial nach außen und zurück
  const breath = Math.sin(t * 0.7) * 0.08 + 0.05;
  blades.forEach((blade) => {
    const a = blade.userData.angle;
    const r = breath;
    blade.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    blade.rotation.z = a;
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
