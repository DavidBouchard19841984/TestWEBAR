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

// Attente de la scène A-Frame chargée
scene.addEventListener('loaded', () => {
  const camera3D = scene.camera;

  // Fonction pour attendre dynamiquement la balise <video> générée par AR.js
  function waitForVideoElement(retries = 20) {
    const videoElement = document.querySelector('video');

    if (videoElement) {
      console.log("✅ Balise <video> trouvée !");
      
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

      // Résultat de MediaPipe : interaction avec les objets
      hands.onResults((results) => {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8]; // Bout de l'index

        // Convertir les coordonnées MediaPipe (0–1) en coordonnées NDC (-1 à +1)
        mouse.x = (indexTip.x - 0.5) * 2;
        mouse.y = (0.5 - indexTip.y) * 2;

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

    } else if (retries > 0) {
      console.warn("⏳ En attente de la vidéo AR... nouvelle tentative");
      setTimeout(() => waitForVideoElement(retries - 1), 300);
    } else {
      alert("❌ Impossible de démarrer la caméra AR. Réessaie dans Safari mobile.");
    }
  }

  waitForVideoElement();
});
