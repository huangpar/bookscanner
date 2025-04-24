import { jsQR } from 'jsqr';
import { useEffect, useRef} from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        const video = videoRef.current;
        if (video) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // Required for iOS
        video.addEventListener('loadmetadata', () => {
          video.play();
          requestAnimationFrame(tick);
        });
      }
      })
      .catch((err) => {
        console.error("Error accessing camera:", err)
      })

    function tick() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          console.log("QR Code Data:", code.data);
          // Optionally draw box or highlight
        }
      }

      requestAnimationFrame(tick);
    }
  }, []);

  return (
    <div>
      <video ref={videoRef} autoplay muted playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
