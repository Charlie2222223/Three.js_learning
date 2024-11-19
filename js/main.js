// js/main.js

// Three.js と OrbitControls をインポート
import * as THREE from 'three';
import { OrbitControls } from '../libs/OrbitControls.js';

// ブラウザのサイズとアスペクト比を取得
const W_WIDTH  = window.innerWidth;
const W_HEIGHT = window.innerHeight;
const W_ASPECT = W_WIDTH / W_HEIGHT;
const W_RATIO  = window.devicePixelRatio;

// 変数宣言
let camera, scene, renderer, earth, moon, sun, mercury, venus;
let controls;

// 水星の周回半径と角度
const mercuryRadius = 150;
let mercuryRadian = 0;

// 金星の周回半径と角度
const venusRadius = 170;
let venusRadian = 0;

// 地球の周回半径と角度
const earthRadius = 200; // 地球の公転半径（太陽からの距離）
let earthRadian = 0;

// 月の周回半径と角度
const moonRadius = 10; // 月の公転半径（地球からの距離）
let moonRadian = 0;

// 初期化関数
function init() {
    // カメラを作成
    camera = new THREE.PerspectiveCamera(50, W_ASPECT, 1, 3000);
    camera.position.set(earthRadius + 800, 600, 800); // カメラ位置を再調整
    camera.lookAt(0, 0, 0);

    // シーンを作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // 背景色を黒に設定

    // 環境光を追加
    const ambLight = new THREE.AmbientLight(0x999999); // 環境光の色を明るく
    scene.add(ambLight);

    // 太陽からの光を表現する PointLight を作成
    const sunLight = new THREE.PointLight(0xffffff, 30, 0, 2); // 強度を20から30に増加
    sunLight.position.set(0, 0, 0); // 太陽の位置に光を配置
    scene.add(sunLight);

    // ライトヘルパーを追加
    const lightHelper = new THREE.PointLightHelper(sunLight, 100); // サイズを100に設定
    scene.add(lightHelper);

    // ディレクショナルライトを一時的にコメントアウト
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // 強度を3に設定
    // directionalLight.position.set(earthRadius, 300, 150); // 光の位置を調整
    // scene.add(directionalLight);

    // ディレクショナルライトヘルパーを一時的にコメントアウト
    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 100);
    // scene.add(directionalLightHelper);

    // レンダラーを作成
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(W_RATIO); // ピクセル比の設定
    renderer.setSize(W_WIDTH, W_HEIGHT); // サイズの設定
    renderer.shadowMap.enabled = true; // シャドウマッピングを有効化

    // HTMLのdivにレンダラーを追加
    const div = document.getElementById("three");
    div.appendChild(renderer.domElement);

    // 太陽を作成
    sun = createMesh(100, "./assets/sun_tx.jpg", true); // 太陽用に emissive を有効化
    sun.castShadow = true;
    scene.add(sun);

    // 水星を作成
    mercury = createMesh(20, "./assets/mercury_tx.jpg");
    mercury.castShadow = true;
    scene.add(mercury);

    // 金星を作成
    venus = createMesh(8, "./assets/venus_tx.jpg");
    venus.castShadow = true;
    scene.add(venus);

    // 地球を作成
    earth = createMesh(9, "./assets/earth_tx.jpg");
    earth.castShadow = true;
    earth.receiveShadow = true;
    scene.add(earth);

    // 月を作成
    moon = createMesh(2, "./assets/moonmap1k.jpg");
    moon.castShadow = true;
    moon.receiveShadow = true;
    scene.add(moon);

    // AxesHelper を追加
    // const axesHelper = new THREE.AxesHelper(1000);
    // scene.add(axesHelper);

    // 星空の作成（オプション）
    const starGeometry = new THREE.SphereGeometry(5000, 64, 64);
    const starTexture = new THREE.TextureLoader().load('./assets/starfield.jpg'); // 星空のテクスチャ
    const starMaterial = new THREE.MeshBasicMaterial({
        map: starTexture,
        side: THREE.BackSide, // 内側に面を表示
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    // オービットコントロールを初期化
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // スムーズな動きを有効化
    controls.dampingFactor = 0.05;

    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', onWindowResize, false);
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);

    // 水星を自転させる
    mercury.rotation.y += 0.005;

    // 水星を太陽の周りに公転させる
    mercuryRadian += 0.005;
    mercury.position.x = mercuryRadius * Math.cos(mercuryRadian);
    mercury.position.z = mercuryRadius * Math.sin(mercuryRadian);

    // 金星を自転させる
    venus.rotation.y += 0.005;

    // 金星を太陽の周りに公転させる
    venusRadian += 0.005;
    venus.position.x = venusRadius * Math.cos(venusRadian);
    venus.position.z = venusRadius * Math.sin(venusRadian);

    // 地球を自転させる
    earth.rotation.y += 0.001;

    // 地球を太陽の周りに公転させる
    earthRadian += 0.001; // 公転速度
    earth.position.x = earthRadius * Math.cos(earthRadian);
    earth.position.z = earthRadius * Math.sin(earthRadian);

    // 月を自転させる
    moon.rotation.y += 0.005;

    // 月を地球の周りに公転させる
    moonRadian += 0.01; // 公転速度
    moon.position.x = earth.position.x + moonRadius * Math.cos(moonRadian);
    moon.position.z = earth.position.z + moonRadius * Math.sin(moonRadian);

    // オービットコントロールの更新
    controls.update();

    // シーンをレンダリング
    renderer.render(scene, camera);
}

// メッシュを作成する関数
function createMesh(r, path, isEmissive = false) {
    const txLoader = new THREE.TextureLoader();
    const texture = txLoader.load(path, undefined, undefined, (err) => {
        console.error('テクスチャの読み込みに失敗しました:', err);
    });

    const geometry = new THREE.SphereGeometry(r, 30, 30);

    const materialOptions = {
        color: 0xffffff,
        map: texture,
        shininess: 100, // 光沢の強さを増加
        specular: new THREE.Color(0xaaaaaa), // スペキュラカラーを設定
    };

    // if (isEmissive) {
    //     materialOptions.emissive = new THREE.Color(0xffffff);
    //     materialOptions.emissiveIntensity = 1;
    // }

    const material = new THREE.MeshPhongMaterial(materialOptions);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = isEmissive; // 太陽のみシャドウを投げる
    mesh.receiveShadow = false;
    return mesh;
}

// ウィンドウリサイズ時の処理
function onWindowResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newAspect = newWidth / newHeight;

    camera.aspect = newAspect;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
}

// 初期化とアニメーション開始
init();
animate();