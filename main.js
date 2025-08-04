// Lancement différé : attend le clic sur "Démarrer"
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-button');
  const overlay = document.getElementById('start-overlay');

  startBtn.addEventListener('click', () => {
    overlay.style.display = 'none'; // Masque l'overlay
    startAR(); // Lance la logique AR
  });
});

// Ta logique AR doit maintenant être encapsulée dans une fonction startAR()
function startAR() {
  const scene = document.querySelector('a-scene');
  const btnHello = document.querySelector('#btnHello');
  const btnBye = document.querySelector('#btnBye');

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.5
  });

  scene.addEventListener('loaded', () => {
    const camera3D = scene.camera;

    function waitForVideoElement(retries = 20) {
      const videoElement = document.querySelector('video');

      if (videoElement) {
        console.log("✅ Balise <video> trouvée !");
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
          if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

          const landmarks = results.multiHandLandmarks[0];
          const indexTip = landmarks[8];

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
        console.warn("⏳ En attente de la vidéo AR...");
        setTimeout(() => waitForVideoElement(retries - 1), 300);
      } else {
        alert("❌ Vidéo non détectée.");
      }
    }

    waitForVideoElement();
  });
}
