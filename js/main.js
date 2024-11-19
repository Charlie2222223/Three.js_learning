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
let currentTarget = null; // 現在追尾中の惑星

// 各惑星の周回半径と角度（公転速度も調整）
const orbits = {
  mercury: { name: 'mercury', radius: 200, radian: 0, speed: 0.04 },
  venus: { name: 'venus', radius: 250, radian: 0, speed: 0.03 },
  earth: { name: 'earth', radius: 300, radian: 0, speed: 0.02 },
  moon: { name: 'moon', radius: 20, radian: 0, speed: 0.1 },
  mars: { name: 'mars', radius: 350, radian: 0, speed: 0.015 },
  jupiter: { name: 'jupiter', radius: 450, radian: 0, speed: 0.01 },
  saturn: { name: 'saturn', radius: 500, radian: 0, speed: 0.008 },
  uranus: { name: 'uranus', radius: 550, radian: 0, speed: 0.007 },
  neptune: { name: 'neptune', radius: 600, radian: 0, speed: 0.006 },
  pluto: { name: 'pluto', radius: 650, radian: 0, speed: 0.005 },
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

  scene.add(mercury, venus, earth, mars, jupiter, uranus, neptune, pluto);

  // 土星の輪を作成して追加
  const saturnRings = createSaturnRings(14, 18, './assets/saturn_ring.jpg');
  saturn.add(saturnRings);
  scene.add(saturn);

  // オービットコントロール
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // UIボタンを作成
  createUI();

  // ウィンドウリサイズ時の処理
  window.addEventListener('resize', onWindowResize, false);
}

// 惑星を後ろから追尾する関数
function followPlanet(planet, orbit, distance = 50) {
  if (!planet || !orbit) return;

  // 惑星の現在の位置
  const planetPosition = planet.position;

  // 公転角度を基に後方の位置を計算
  const offsetX = -Math.cos(orbit.radian) * distance;
  const offsetZ = -Math.sin(orbit.radian) * distance;

  // カメラの位置を惑星の後ろに設定
  camera.position.set(
    planetPosition.x + offsetX,
    planetPosition.y + distance * 0.5, // 少し上から見るように
    planetPosition.z + offsetZ
  );

  // カメラが惑星を注視する
  camera.lookAt(planetPosition);
}

// UIボタンを作成する関数
function createUI() {
  const uiContainer = document.createElement('div');
  uiContainer.style.position = 'absolute';
  uiContainer.style.top = '10px';
  uiContainer.style.left = '10px';

  const planets = [
    { name: '水星', object: mercury },
    { name: '金星', object: venus },
    { name: '地球', object: earth },
    { name: '火星', object: mars },
    { name: '木星', object: jupiter },
    { name: '土星', object: saturn },
    { name: '天王星', object: uranus },
    { name: '海王星', object: neptune },
    { name: '冥王星', object: pluto },
  ];

  planets.forEach((planet) => {
    const button = document.createElement('button');
    button.textContent = planet.name;
    button.style.margin = '5px';
    button.onclick = () => {
      currentTarget = planet.object; // 追尾対象を変更
    };
    uiContainer.appendChild(button);
  });

  document.body.appendChild(uiContainer);
}

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);

  // 公転処理
  Object.keys(orbits).forEach((key) => {
    const orbit = orbits[key];
    orbit.radian += orbit.speed;
    const planet = eval(key); // 文字列から変数を取得
    if (planet) {
      planet.position.x = orbit.radius * Math.cos(orbit.radian);
      planet.position.z = orbit.radius * Math.sin(orbit.radian);
    }
  });

  // 追尾処理
  if (currentTarget) {
    const orbit = Object.values(orbits).find((o) => eval(o.name) === currentTarget);
    followPlanet(currentTarget, orbit);
  }

  controls.update();
  renderer.render(scene, camera);
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

// 土星の輪を作成する関数
function createSaturnRings(innerRadius, outerRadius, texturePath) {
  const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  const ringTexture = new THREE.TextureLoader().load(texturePath);

  const ringMaterial = new THREE.MeshBasicMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);

  ring.rotation.x = Math.PI / 4;

  return ring;
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