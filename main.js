// 必要な変数の宣言
let scene, camera, renderer, spheres = [], rotationSpeeds = [], movementSpeeds = [];
const boundary = {
  x: { min: -10, max: 10 },
  y: { min: -2, max: 10 },
  z: { min: -10, max: 10 }
};

// Raycasterとマウスベクトルの初期化
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 初期化関数
function init() {
  // シーンの作成
  scene = new THREE.Scene();

  // カメラの設定
  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // レンダラーの設定
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // シャドウマッピングを有効にする
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // ソフトシャドウ

  // レンダラーをDOMに追加
  document.body.appendChild(renderer.domElement);

  // 環境光の追加
  const ambientLight = new THREE.AmbientLight(0x404040); // ソフトな環境光
  scene.add(ambientLight);

  // 方向性ライトの追加
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5); // ライトの位置
  directionalLight.castShadow = true; // シャドウキャストを有効にする

  // シャドウの品質設定
  directionalLight.shadow.mapSize.width = 1024; // 解像度
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;

  scene.add(directionalLight);

  // 地面の作成
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2; // 水平に配置
  plane.position.y = -2; // 球体の下に配置
  plane.receiveShadow = true; // シャドウを受け取る
  scene.add(plane);

  // 複数の球体の作成
  const geometry = new THREE.SphereGeometry(1.5, 32, 32);

  for (let i = 0; i < 5; i++) {
    // ランダムな色のマテリアルを作成
    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    
    // ランダムな位置に配置
    sphere.position.x = Math.random() * 10 - 5;
    sphere.position.y = Math.random() * 2;
    sphere.position.z = Math.random() * 10 - 5;
    
    // シャドウの設定
    sphere.castShadow = true;
    sphere.receiveShadow = false;
    
    // シーンに追加
    scene.add(sphere);
    spheres.push(sphere);
    
    // 各球体にランダムな回転速度を設定
    rotationSpeeds.push({
      x: Math.random() * 0.02,
      y: Math.random() * 0.02
    });
    
    // 各球体にランダムな移動速度を設定
    movementSpeeds.push({
      x: (Math.random() - 0.5) * 0.05, // -0.025 から 0.025 の範囲
      y: (Math.random() - 0.5) * 0.05,
      z: (Math.random() - 0.5) * 0.05
    });
  }

  // カメラの位置を設定
  camera.position.z = 15; /* カメラの位置を手前に変更 */
}

// アニメーション制御関数
function animate() {
  requestAnimationFrame(animate);
  
  spheres.forEach((sphere, index) => {
    // 回転の更新
    sphere.rotation.x += rotationSpeeds[index].x;
    sphere.rotation.y += rotationSpeeds[index].y;
    
    // 位置の更新
    sphere.position.x += movementSpeeds[index].x;
    sphere.position.y += movementSpeeds[index].y;
    sphere.position.z += movementSpeeds[index].z;
    
    // 衝突検出とバウンス処理
    // X軸
    if (sphere.position.x <= boundary.x.min || sphere.position.x >= boundary.x.max) {
      movementSpeeds[index].x *= -1;
      sphere.position.x = THREE.MathUtils.clamp(sphere.position.x, boundary.x.min, boundary.x.max);
    }
    // Y軸
    if (sphere.position.y <= boundary.y.min || sphere.position.y >= boundary.y.max) {
      movementSpeeds[index].y *= -1;
      sphere.position.y = THREE.MathUtils.clamp(sphere.position.y, boundary.y.min, boundary.y.max);
    }
    // Z軸
    if (sphere.position.z <= boundary.z.min || sphere.position.z >= boundary.z.max) {
      movementSpeeds[index].z *= -1;
      sphere.position.z = THREE.MathUtils.clamp(sphere.position.z, boundary.z.min, boundary.z.max);
    }
  });

  renderer.render(scene, camera);
}

// ウィンドウ変更時にサイズを維持する処理
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// クリックイベントハンドラー
function onClick(event) {
  // マウス座標を正規化（-1から+1の範囲）
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Raycasterを使用してオブジェクトとの交差を判定
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(spheres);

  if (intersects.length > 0) {
    const clickedSphere = intersects[0].object;
    
    // 球体の色をランダムに変更
    clickedSphere.material.color.set(Math.random() * 0xffffff);

    // 例：スケールを一時的に変更（拡大）
    clickedSphere.scale.set(2, 2, 2);
    setTimeout(() => {
      clickedSphere.scale.set(1, 1, 1); // 元のサイズに戻す
    }, 500); // 0.5秒後に元に戻す
  }
}

// イベントリスナーの追加
window.addEventListener('click', onClick, false);
window.addEventListener("resize", onWindowResize);

// 初期化とアニメーション開始
init();
animate();