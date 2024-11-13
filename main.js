// 必要な変数の宣言
let scene, camera, renderer, spheres = [], rotationSpeeds = [], movementSpeeds = [];
const boundary = {
  x: { min: -10, max: 10 },
  y: { min: 0, max: 10 }, // 無重力のためy.minを調整
  z: { min: -10, max: 10 }
};

// Raycasterとマウスベクトルの初期化
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// テクスチャローダーとフォントローダーの初期化
const textureLoader = new THREE.TextureLoader();
const fontLoader = new THREE.FontLoader();

// ロードする画像のURL（必要に応じて変更してください）
const textureURL = 'img/sample.jpg'; // 例: 外部URL

// テクスチャのロード
const sphereTexture = textureLoader.load(
  textureURL,
  () => { console.log('テクスチャが正常にロードされました。'); },
  undefined,
  (err) => { console.error('テクスチャのロードに失敗しました:', err); }
);

// フォントのロード
fontLoader.load(
  './fonts/helvetiker_regular.typeface.json', // フォントファイルのパス
  function (font) {
    createTextForSpheres(font);
  },
  undefined,
  function (err) {
    console.error('フォントのロードに失敗しました:', err);
  }
);

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
  plane.position.y = 0; // 床の位置をy=0に設定
  plane.receiveShadow = true; // シャドウを受け取る
  scene.add(plane);

  // 複数の球体の作成
  const geometry = new THREE.SphereGeometry(1.5, 32, 32);

  for (let i = 0; i < 5; i++) {
    // ランダムな色のマテリアルを作成
    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);    
    
    // ランダムな位置に配置（床に食い込まないように y を調整）
    sphere.position.x = Math.random() * 10 - 5;
    sphere.position.y = Math.random() * 8 + 1.5; // 床から少し上（例：1.5 から 9.5）
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
      y: (Math.random() - 0.5) * 0.05, // 重力を無効化するために初期Y速度もランダムに設定
      z: (Math.random() - 0.5) * 0.05
    });
  }

  // カメラの位置を設定
  camera.position.set(0, 5, 15); // 少し上から全体を見渡せる位置に設定
}

// アニメーション制御関数
function animate() {
  requestAnimationFrame(animate);
  
  spheres.forEach((sphere, index) => {
    // 回転の更新
    sphere.rotation.x += rotationSpeeds[index].x;
    sphere.rotation.y += rotationSpeeds[index].y;
    
    // 重力の適用を削除
    // movementSpeeds[index].y += gravity;
    
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
    // Y軸（床との衝突）
    if (sphere.position.y - 1.5 <= boundary.y.min) { // 床のy位置が0で球体の半径が1.5
      movementSpeeds[index].y *= -0.7; // 反射後の速度を減衰（エネルギー損失）
      sphere.position.y = boundary.y.min + 1.5; // 床に球体が食い込まないように調整
    }
    if (sphere.position.y + 1.5 >= boundary.y.max) {
      movementSpeeds[index].y *= -1;
      sphere.position.y = boundary.y.max - 1.5;
    }
    // Z軸
    if (sphere.position.z <= boundary.z.min || sphere.position.z >= boundary.z.max) {
      movementSpeeds[index].z *= -1;
      sphere.position.z = THREE.MathUtils.clamp(sphere.position.z, boundary.z.min, boundary.z.max);
    }
  });

  // 球体同士の衝突検出と反応
  for (let i = 0; i < spheres.length; i++) {
    for (let j = i + 1; j < spheres.length; j++) {
      const sphere1 = spheres[i];
      const sphere2 = spheres[j];
      
      const distance = sphere1.position.distanceTo(sphere2.position);
      const minDistance = 3; // 1.5 + 1.5 (各球体の半径)
      
      if (distance < minDistance) {
        // 衝突が発生した場合

        // 衝突方向の正規化ベクトル
        const collisionNormal = new THREE.Vector3().subVectors(sphere2.position, sphere1.position).normalize();
        
        // 各球体の速度ベクトル
        const v1 = new THREE.Vector3(movementSpeeds[i].x, movementSpeeds[i].y, movementSpeeds[i].z);
        const v2 = new THREE.Vector3(movementSpeeds[j].x, movementSpeeds[j].y, movementSpeeds[j].z);
        
        // 衝突方向に沿った速度の成分を計算
        const v1Proj = collisionNormal.clone().multiplyScalar(v1.dot(collisionNormal));
        const v2Proj = collisionNormal.clone().multiplyScalar(v2.dot(collisionNormal));
        
        // 速度の交換（完全弾性衝突を仮定）
        movementSpeeds[i].x = v2Proj.x - (v1.clone().sub(v1Proj)).x;
        movementSpeeds[i].y = v2Proj.y - (v1.clone().sub(v1Proj)).y;
        movementSpeeds[i].z = v2Proj.z - (v1.clone().sub(v1Proj)).z;
        
        movementSpeeds[j].x = v1Proj.x - (v2.clone().sub(v2Proj)).x;
        movementSpeeds[j].y = v1Proj.y - (v2.clone().sub(v2Proj)).y;
        movementSpeeds[j].z = v1Proj.z - (v2.clone().sub(v2Proj)).z;
        
        // 重なりを解消するために位置を調整
        const overlap = minDistance - distance;
        const adjustment = collisionNormal.clone().multiplyScalar(overlap / 2);
        sphere1.position.sub(adjustment);
        sphere2.position.add(adjustment);
      }
    }
  }

  renderer.render(scene, camera);
}

// ウィンドウ変更時にサイズを維持する処理
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 球体に文字を追加する関数
function createTextForSpheres(font) {
  spheres.forEach((sphere, index) => {
    const text = `Sphere ${index + 1}`;
    const textGeometry = new THREE.TextGeometry(text, {
      font: font,
      size: 0.5,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 5
    });

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // テキストの中心を原点にする
    textGeometry.computeBoundingBox();
    const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
    textMesh.position.set(centerOffset, 2, 0); // y軸方向に少し上に配置

    // テキストを球体の子として追加
    sphere.add(textMesh);
  });
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
    
    // テクスチャを適用
    clickedSphere.material.map = sphereTexture;
    clickedSphere.material.needsUpdate = true;

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