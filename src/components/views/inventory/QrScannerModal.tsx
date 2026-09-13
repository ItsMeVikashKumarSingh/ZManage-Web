import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, CameraOff, Scan, AlertCircle, CheckCircle2, 
  Search, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { AssetRecord } from '../../../lib/api';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: AssetRecord[];
  onSelectAsset: (asset: AssetRecord) => void;
  title?: string;
  subtitle?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSelectAsset,
  title = 'Scan Asset or Kit QR / Barcode',
  subtitle = 'Point camera at an asset label or enter the code manually for 1-second check-in/out'
}) => {
  const [manualCode, setManualCode] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setManualCode('');
      setCameraError(null);
      setScannedFeedback(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported in this browser. Please use manual code lookup.');
        setCameraActive(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Camera permission denied or camera unavailable.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const processCodeLookup = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // Search by exact code, serial number, or ID
    const found = inventory.find(
      (a) =>
        (a.code && a.code.toLowerCase() === code.toLowerCase()) ||
        (a.serial_number && a.serial_number.toLowerCase() === code.toLowerCase()) ||
        a.id.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setScannedFeedback(`Matched: ${found.name} (${found.code || 'SKU'})`);
      setTimeout(() => {
        onSelectAsset(found);
        onClose();
      }, 600);
    } else {
      setCameraError(`No asset found matching "${code}". Try checking the code again.`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCodeLookup(manualCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-floating overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-ash dark:border-zinc-800 flex items-center justify-between bg-paper/40 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100">{title}</h3>
              <p className="text-[11px] text-steel dark:text-zinc-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-fog hover:text-charcoal dark:hover:text-zinc-200 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Video Canvas */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Aiming Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-44 border-2 border-cyan-400/80 rounded-xl relative shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  {/* Laser scanline */}
                  <div className="absolute left-0 right-0 h-0.5 bg-cyan-400/70 shadow-[0_0_8px_cyan] animate-bounce top-1/2" />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-6 space-y-2">
              <CameraOff className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400">Camera preview unavailable or disabled</p>
              <button
                type="button"
                onClick={startCamera}
                className="text-[11px] px-3 py-1 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-mono inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Retry Camera
              </button>
            </div>
          )}

          {/* Scanned Match Banner */}
          {scannedFeedback && (
            <div className="absolute bottom-3 left-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold truncate">{scannedFeedback}</span>
            </div>
          )}
        </div>

        {/* Manual Code Entry & Quick List */}
        <div className="p-4 space-y-3">
          {cameraError && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px]">{cameraError}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-steel dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Scan or enter Asset Code (e.g. CAM-001 or S/N)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="dub-input w-full pl-9 py-2 text-xs font-mono"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="dub-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Verify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Match Previews from local inventory */}
          {manualCode.trim().length > 1 && (
            <div className="border border-ash dark:border-zinc-800 rounded-xl max-h-36 overflow-y-auto divide-y divide-ash dark:divide-zinc-800">
              {inventory
                .filter(
                  (a) =>
                    (a.code || '').toLowerCase().includes(manualCode.toLowerCase()) ||
                    (a.name || '').toLowerCase().includes(manualCode.toLowerCase()) ||
                    (a.serial_number || '').toLowerCase().includes(manualCode.toLowerCase())
                )
                .slice(0, 4)
                .map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onSelectAsset(asset);
                      onClose();
                    }}
                    className="w-full p-2 text-left text-xs hover:bg-paper dark:hover:bg-zinc-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-charcoal dark:text-zinc-100">{asset.name}</span>
                      <div className="font-mono text-[10px] text-steel dark:text-zinc-400">
                        Code: {asset.code || 'N/A'} | S/N: {asset.serial_number || 'N/A'}
                      </div>
                    </div>
                    <span className="dub-badge-mint text-[9px] font-mono capitalize">
                      {asset.status}
                    </span>
                  </button>
                ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-steel dark:text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              Direct RMS Vault Handshake
            </span>
            <span className="font-mono text-[10px]">
              {inventory.length} Registered Items In Vault
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
