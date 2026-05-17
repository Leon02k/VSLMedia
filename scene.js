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
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(5, 4, 5);
scene.add(key);
const rim = new THREE.PointLight(0xc8d4e0, 1.8, 12);
rim.position.set(-3, -2, 3);
scene.add(rim);
const fill = new THREE.PointLight(0xe5dcc8, 1.4, 12);
fill.position.set(3, 2, -2);
scene.add(fill);

// ───── Central torus knot ─────
const knotGeo = new THREE.TorusKnotGeometry(1.1, 0.32, 220, 32, 2, 3);
const knotMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8e8ec,
  metalness: 0.7,
  roughness: 0.22,
  clearcoat: 1.0,
  clearcoatRoughness: 0.2,
  reflectivity: 0.9,
});
const knot = new THREE.Mesh(knotGeo, knotMat);
scene.add(knot);

// ───── Wireframe halo ─────
const haloGeo = new THREE.IcosahedronGeometry(2.4, 1);
const haloMat = new THREE.MeshBasicMaterial({
  color: 0x0a0a0b,
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
  color: 0x0a0a0b,
  size: 0.018,
  transparent: true,
  opacity: 0.35,
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

  knot.rotation.x = t * 0.15 + mouse.y * 0.4;
  knot.rotation.y = t * 0.2 + mouse.x * 0.5;
  knot.position.y = Math.sin(t * 0.6) * 0.08;

  halo.rotation.x = -t * 0.05;
  halo.rotation.y = t * 0.08;

  points.rotation.y = t * 0.02;
  points.rotation.x = mouse.y * 0.15;

  // Scroll moves the camera back slightly, so the knot recedes
  camera.position.z = 6 + scrollY * 4;
  camera.position.y = -scrollY * 1.2;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
