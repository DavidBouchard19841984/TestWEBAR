// Récupère la vidéo créée automatiquement par AR.js
const videoElement = document.querySelector('video');

// Récupère les entités 3D
const scene = document.querySelector('a-scene');
const btnHello = document.querySelector('#btnHello');
const btnBye = document.querySelector('#btnBye');

// Crée un raycaster Three.js
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Récupère la caméra A-Frame
let camera3D = null;
scene.addEventListener('loaded', () => {
  camera3D = scene.camera;
});

// Initialise MediaPipe
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.5
});

// Lance MediaPipe dès que la vidéo d'AR.js est prête
videoElement.addEventListener('loadeddata', () => {
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });
  camera.start();
});
hands.onResults((results) => {
  if (!camera3D) return;
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

  const landmarks = results.multiHandLandmarks[0];
  const indexTip = landmarks[8]; // landmark du bout du doigt

  // Convertir les coordonnées normalisées [0-1] en coordonnées écran
  mouse.x = (indexTip.x - 0.5) * 2;  // -1 à +1
  mouse.y = (0.5 - indexTip.y) * 2;

  // Raycast depuis la caméra
  raycaster.setFromCamera(mouse, camera3D);

  const objects = [
    btnHello.object3D,
    btnBye.object3D
  ];

  const intersects = raycaster.intersectObjects(objects, true);

  if (intersects.length > 0) {
    const name = intersects[0].object.el.id;
    if (name === 'btnHello') alert("👋 Bonjour !");
    else if (name === 'btnBye') alert("👋 Au revoir !");
  }
});

// Caméra arrière (getUserMedia)
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }
}).then((stream) => {
  videoElement.srcObject = stream;
  videoElement.play();

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });
  camera.start();
}).catch((err) => {
  console.error("Erreur accès caméra :", err);
});
