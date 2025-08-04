// Récupère les entités A-Frame
const scene = document.querySelector('a-scene');
const btnHello = document.querySelector('#btnHello');
const btnBye = document.querySelector('#btnBye');

// Crée un Raycaster pour détecter les collisions main → objet
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Initialise MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.5
});

// On attend que la scène soit complètement chargée
scene.addEventListener('loaded', () => {
  const camera3D = scene.camera;

  // ⚠️ Important : attendre que la <video> soit créée par AR.js
  const videoElement = document.querySelector('video');

  if (!videoElement) {
    console.error("❌ Aucune balise <video> trouvée par AR.js !");
    return;
  }

  // Démarre MediaPipe quand la vidéo est prête
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

  // Interaction main ↔ objets
  hands.onResults((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const landmarks = results.multiHandLandmarks[0];
    const indexTip = landmarks[8]; // Bout de l'index

    // Convertir les coordonnées MediaPipe (0–1) en coordonnées NDC (-1 à +1)
    mouse.x = (indexTip.x - 0.5) * 2;
    mouse.y = (0.5 - indexTip.y) * 2;

    // Raycaster depuis la caméra AR.js
    raycaster.setFromCamera(mouse, camera3D);

    const targets = [
      btnHello.object3D,
      btnBye.object3D
    ];

    const intersects = raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object.el.id;
      if (hit === 'btnHello') {
        alert("👋 Bonjour !");
      } else if (hit === 'btnBye') {
        alert("👋 Au Revoir !");
      }
    }
  });
});
