// Attend que le DOM soit entièrement chargé
window.addEventListener('load', () => {
  const startButton = document.querySelector('#start-button');
  const overlay = document.querySelector('#start-overlay');
  const scene = document.querySelector('a-scene');

  startButton.addEventListener('click', () => {
    // Cache la superposition et commence l'expérience
    overlay.style.display = 'none';
    startExperience();
  });

  function startExperience() {
    // ▼▼▼ CORRECTION ▼▼▼
    // On déplace les déclarations qui dépendent de THREE ici,
    // pour être sûr qu'il est chargé.
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    // ▲▲▲ FIN DE LA CORRECTION ▲▲▲

    const btnHello = document.querySelector('#btnHello');
    const btnBye = document.querySelector('#btnBye');

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
              // Pour éviter les alertes multiples, on peut ajouter une petite temporisation
              if (!window.isAlerting) {
                 window.isAlerting = true;
                 if (hit === 'btnHello') {
                   alert("👋 Bonjour !");
                 } else if (hit === 'btnBye') {
                   alert("👋 Au Revoir !");
                 }
                 setTimeout(() => { window.isAlerting = false; }, 1000); // Bloque les alertes pendant 1 seconde
              }
            }
          });

        } else if (retries > 0) {
          console.warn("⏳ En attente de la vidéo AR... nouvelle tentative");
          setTimeout(() => waitForVideoElement(retries - 1), 300);
        } else {
          alert("❌ Impossible de démarrer la caméra AR. Assurez-vous d'utiliser HTTPS et d'autoriser l'accès à la caméra.");
        }
      }

      waitForVideoElement();
    });
  }
});