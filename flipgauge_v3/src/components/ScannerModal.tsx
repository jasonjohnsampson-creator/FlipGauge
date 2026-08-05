import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>>;
};

declare global { interface Window { BarcodeDetector?: BarcodeDetectorConstructor } }

export function ScannerModal({ onClose, onScan }: { onClose: () => void; onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Starting camera…');

  useEffect(() => {
    let stream: MediaStream | undefined;
    let timer = 0;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (!window.BarcodeDetector) {
          setStatus('Camera is ready. Automatic barcode detection is not supported in this browser.');
          return;
        }
        const detector = new window.BarcodeDetector({ formats: ['upc_a','upc_e','ean_13','ean_8','code_128'] });
        setStatus('Aim the barcode inside the frame.');
        timer = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          const found = await detector.detect(videoRef.current);
          if (found[0]?.rawValue) onScan(found[0].rawValue);
        }, 650);
      } catch {
        setStatus('Camera permission was blocked. You can still type the UPC or ASIN.');
      }
    };
    void start();
    return () => { window.clearInterval(timer); stream?.getTracks().forEach((track) => track.stop()); };
  }, [onScan]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="scanner-modal">
        <button className="icon-button close-button" onClick={onClose} aria-label="Close scanner"><X size={20}/></button>
        <div className="scanner-title"><Camera size={22}/><div><strong>Scan barcode</strong><span>{status}</span></div></div>
        <div className="camera-shell"><video ref={videoRef} playsInline muted/><div className="scan-frame"/></div>
      </div>
    </div>
  );
}
