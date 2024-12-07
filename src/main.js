import './style.css'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(1, 5, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// OrbitControls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  
controls.dampingFactor = 0.25; 
controls.screenSpacePanning = false;  


const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);


scene.fog = new THREE.Fog(0xffffff, 10, 50); 


const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4); 
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

// Snowman Model
const loader = new GLTFLoader();
let snowmanMixer = null;
let snowman = null;

const modelUrl = '/snowman.glb';

loader.load(
  modelUrl,
  (gltf) => {
    snowman = gltf.scene;
    snowman.position.set(0, 0, 0);
    snowman.scale.set(5, 5, 5);
    scene.add(snowman);

    
    if (gltf.animations && gltf.animations.length > 0) {
      snowmanMixer = new THREE.AnimationMixer(snowman);
      const action = snowmanMixer.clipAction(gltf.animations[0]);
      action.play();
    }
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the snowman model:', error);
  }
);

const safeRadius = 5; 
const snowmanPosition = new THREE.Vector3(0, 0, 0); 

// Trees 
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

for (let i = 0; i < 40; i++) {
  let x, z;


  do {
    x = Math.random() * 40 - 20;
    z = Math.random() * 40 - 20;
  } while (snowmanPosition.distanceTo(new THREE.Vector3(x, 0, z)) < safeRadius);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 4, 16),
    trunkMaterial
  );
  trunk.position.set(x, 2, z);
  trunk.castShadow = true;

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(2, 6, 16),
    leafMaterial
  );
  foliage.position.set(x, 5, z);
  foliage.castShadow = true;

  scene.add(trunk);
  scene.add(foliage);
}

// Mushrooms 
const mushroomCapMaterial = new THREE.MeshStandardMaterial({ emissive: 0xff2222 });
const mushroomStemMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

for (let i = 0; i < 50; i++) {
  let x, z;


  do {
    x = Math.random() * 40 - 20;
    z = Math.random() * 40 - 20;
  } while (snowmanPosition.distanceTo(new THREE.Vector3(x, 0, z)) < safeRadius);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.2, 0.5),
    mushroomStemMaterial
  );
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.3, 8),
    mushroomCapMaterial
  );
  stem.position.set(x, 0.25, z);
  cap.position.set(x, 0.55, z);

  stem.castShadow = true;
  cap.castShadow = true;

  scene.add(stem);
  scene.add(cap);
}


const fireflies = [];
for (let i = 0; i < 15; i++) {
  let x, y, z;

  do {
    x = Math.random() * 40 - 20;
    y = Math.random() * 5 + 1;
    z = Math.random() * 40 - 20;
  } while (snowmanPosition.distanceTo(new THREE.Vector3(x, 0, z)) < safeRadius);

  const firefly = new THREE.PointLight(0xffff00, 2, 7);
  firefly.position.set(x, y, z);
  scene.add(firefly);

  fireflies.push({
    light: firefly,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    ),
  });
}

const snowParticles = new THREE.BufferGeometry();
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  opacity: 0.8,
  transparent: true,
});

const snowflakeCount = 5000;
const positions = new Float32Array(snowflakeCount * 3); 

for (let i = 0; i < snowflakeCount; i++) {
  positions[i * 3] = Math.random() * 50 - 25; 
  positions[i * 3 + 1] = Math.random() * 30 + 5;
  positions[i * 3 + 2] = Math.random() * 50 - 25; 
}


snowParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const snow = new THREE.Points(snowParticles, snowMaterial);
scene.add(snow);

const animate = () => {

  const positionsArray = snowParticles.attributes.position.array;
  for (let i = 0; i < positionsArray.length; i += 3) {
    positionsArray[i + 1] -= 0.05; 

    if (positionsArray[i + 1] < 0) {
      positionsArray[i + 1] = 30; 
    }
  }

  snowParticles.attributes.position.needsUpdate = true;


  for (let i = 0; i < fireflies.length; i++) {
    const firefly = fireflies[i];
    const position = firefly.light.position;
    const velocity = firefly.velocity;


    position.add(velocity);

    if (position.x < -20 || position.x > 20) velocity.x *= -1;
    if (position.y < 1 || position.y > 6) velocity.y *= -1;
    if (position.z < -20 || position.z > 20) velocity.z *= -1;
  }


  controls.update(); 

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});