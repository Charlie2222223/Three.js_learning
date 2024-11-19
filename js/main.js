// Three.js と OrbitControls をインポート
import * as THREE from 'three';
import { OrbitControls } from '../libs/OrbitControls.js';

// ブラウザのサイズとアスペクト比を取得
const W_WIDTH = window.innerWidth;
const W_HEIGHT = window.innerHeight;
const W_ASPECT = W_WIDTH / W_HEIGHT;
const W_RATIO = window.devicePixelRatio;

// 変数宣言
let camera, scene, renderer, controls;
let sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune, pluto;

// 各惑星の周回半径と角度（公転速度も調整）
const orbits = {
  mercury: { radius: 200, radian: 0, speed: 0.04 },
  venus: { radius: 250, radian: 0, speed: 0.03 },
  earth: { radius: 300, radian: 0, speed: 0.02 },
  moon: { radius: 20, radian: 0, speed: 0.1 },
  mars: { radius: 350, radian: 0, speed: 0.015 },
  jupiter: { radius: 450, radian: 0, speed: 0.01 },
  saturn: { radius: 500, radian: 0, speed: 0.008 },
  uranus: { radius: 550, radian: 0, speed: 0.007 },
  neptune: { radius: 600, radian: 0, speed: 0.006 },
  pluto: { radius: 650, radian: 0, speed: 0.005 },
};

// 初期化関数
function init() {
  // カメラを作成
  camera = new THREE.PerspectiveCamera(50, W_ASPECT, 1, 3000);
  camera.position.set(800, 600, 800);
  camera.lookAt(0, 0, 0);

  // シーンを作成
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // 環境光と太陽光
  const ambLight = new THREE.AmbientLight(0x999999, 1.5);
  scene.add(ambLight);

  const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(W_RATIO);
  renderer.setSize(W_WIDTH, W_HEIGHT);
  renderer.shadowMap.enabled = true;

  // HTMLのdivにレンダラーを追加
  const div = document.getElementById('three');
  div.appendChild(renderer.domElement);

  // 太陽を作成
  sun = createMesh(100, './assets/sun_tx.jpg', true);
  scene.add(sun);

  // 惑星を作成
  mercury = createMesh(3, './assets/mercury_tx.jpg');
  venus = createMesh(6, './assets/venus_tx.jpg');
  earth = createMesh(6.5, './assets/earth_tx.jpg');
  moon = createMesh(1.5, './assets/moonmap1k.jpg');
  mars = createMesh(4, './assets/mars_tk.jpg');
  jupiter = createMesh(14, './assets/jupiter_tx.jpg');
  saturn = createMesh(12, './assets/saturn_tx.jpg');
  uranus = createMesh(9, './assets/uranus_tx.jpg');
  neptune = createMesh(9, './assets/neptune_tx.jpg');
  pluto = createMesh(2.5, './assets/pluto_tx.jpg');

  scene.add(mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto);

  // オービットコントロール
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // ウィンドウリサイズ時の処理
  window.addEventListener('resize', onWindowResize, false);
}

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);

  // 公転処理
  updateOrbit(mercury, 'mercury');
  updateOrbit(venus, 'venus');
  updateOrbit(earth, 'earth');
  updateOrbit(mars, 'mars');
  updateOrbit(jupiter, 'jupiter');
  updateOrbit(saturn, 'saturn');
  updateOrbit(uranus, 'uranus');
  updateOrbit(neptune, 'neptune');
  updateOrbit(pluto, 'pluto');

  // 月の公転処理（地球の周り）
  orbits.moon.radian += orbits.moon.speed;
  moon.position.x = earth.position.x + orbits.moon.radius * Math.cos(orbits.moon.radian);
  moon.position.z = earth.position.z + orbits.moon.radius * Math.sin(orbits.moon.radian);

  controls.update();
  renderer.render(scene, camera);
}

// 公転を更新する関数
function updateOrbit(planet, name) {
  const orbit = orbits[name];
  orbit.radian += orbit.speed;
  planet.position.x = orbit.radius * Math.cos(orbit.radian);
  planet.position.z = orbit.radius * Math.sin(orbit.radian);
}

// メッシュを作成する関数
function createMesh(size, texturePath, isEmissive = false) {
  const txLoader = new THREE.TextureLoader();
  const texture = txLoader.load(texturePath);

  const geometry = new THREE.SphereGeometry(size, 30, 30);
  const materialOptions = {
    map: texture,
    shininess: 100,
    specular: new THREE.Color(0xaaaaaa),
  };

  if (isEmissive) {
    materialOptions.emissive = new THREE.Color(0xffffff);
    materialOptions.emissiveIntensity = 2;
  }

  const material = new THREE.MeshPhongMaterial(materialOptions);
  return new THREE.Mesh(geometry, material);
}

// ウィンドウリサイズ時の処理
function onWindowResize() {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
}

// 初期化とアニメーション開始
init();
animate();