const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

// Adapter le canvas à l'écran
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;

function isInsideButton(x, y, button) {
  const rect = button.getBoundingClientRect();
  return (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
}

// Initialisation de MediaPipe Hands
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
});

hands.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    const x = landmarks[8].x * canvasElement.width;
    const y = landmarks[8].y * canvasElement.height;

    // Cercle rouge sur le doigt
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 10, 0, 2 * Math.PI);
    canvasCtx.fillStyle = 'red';
    canvasCtx.fill();

    if (isInsideButton(x, y, document.getElementById("btnHello"))) {
      console.log("👉 Bonjour !");
    }
    if (isInsideButton(x, y, document.getElementById("btnBye"))) {
      console.log("👉 Au Revoir !");
    }
  }

  canvasCtx.restore();
});

// 📷 Caméra arrière manuelle (robuste)
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } },
  audio: false,
})
.then((stream) => {
  videoElement.srcObject = stream;
  videoElement.play();

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
  camera.start();
})
.catch((err) => {
  console.error("Échec d'accès à la caméra arrière :", err);
});
