import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
};

const ImageCropper = ({ imageSrc, onCropComplete, onApply, onCancel, aspect = 4/3 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((newCrop) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    if (onCropComplete) onCropComplete(croppedArea, croppedAreaPixels);
  }, [onCropComplete]);

  const handleApply = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const url = URL.createObjectURL(blob);
      onApply(url, blob);
    } catch (e) {
      console.error('Crop failed:', e);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0" onClick={onCancel} />
      <div className="relative z-10 bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden m-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Potong Gambar</h3>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-[320px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Zoom Slider */}
        <div className="px-5 py-4">
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Zoom: {zoom.toFixed(1)}x
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropper;
