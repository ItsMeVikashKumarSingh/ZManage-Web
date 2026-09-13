import React, { useRef } from 'react';
import { X, Printer, QrCode } from 'lucide-react';

export interface PrintableLabelItem {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  serial_number?: string | null;
  location_name?: string | null;
  type: 'asset' | 'kit';
  condition?: string | null;
}

interface PrintableLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: PrintableLabelItem[];
  projectName?: string;
}

export const PrintableLabelModal: React.FC<PrintableLabelModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  projectName = 'Studio Vault'
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getQrCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}&margin=4`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-2xl w-full max-w-3xl shadow-floating overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-ash dark:border-zinc-800 flex items-center justify-between bg-paper/40 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal dark:text-zinc-100">{title}</h3>
              <p className="text-[11px] text-steel dark:text-zinc-400">
                Print ready {items.length} label sticker{items.length !== 1 ? 's' : ''} (Avery / Brother standard compatible)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="dub-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Labels</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-fog hover:text-charcoal dark:hover:text-zinc-200 rounded-lg hover:bg-paper dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-zinc-50 dark:bg-zinc-950/40 print:bg-white print:p-0">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-labels-area, #printable-labels-area * {
                visibility: visible;
              }
              #printable-labels-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 10px;
                background: white !important;
              }
              .label-card {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          `}</style>

          <div id="printable-labels-area" ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="label-card bg-white border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-3 flex items-center gap-3.5 shadow-xs relative overflow-hidden"
              >
                {/* Brand Strip */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-600" />

                {/* QR Code */}
                <div className="w-24 h-24 shrink-0 bg-white border border-zinc-200 dark:border-zinc-300 rounded-lg p-1 flex items-center justify-center shadow-2xs">
                  <img
                    src={getQrCodeUrl(item.code || item.id)}
                    alt={`QR for ${item.code}`}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                </div>

                {/* Asset Metadata */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-xs font-bold text-charcoal tracking-wide bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                        {item.code || 'NO-SKU'}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                        {item.type === 'kit' ? 'KIT BUNDLE' : (item.category || 'ASSET')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-charcoal truncate mt-1 leading-tight">
                      {item.name}
                    </h4>

                    {item.serial_number && (
                      <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                        S/N: {item.serial_number}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-1 border-t border-zinc-100 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                    <span className="truncate">{item.location_name || projectName}</span>
                    <span className="shrink-0 font-bold text-zinc-600">ZMANAGE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12 text-xs text-steel">
              No label items selected for printing.
            </div>
          )}
        </div>

        {/* Footer Notes */}
        <div className="px-5 py-2.5 border-t border-ash dark:border-zinc-800 bg-paper/20 dark:bg-zinc-900/40 text-[11px] text-steel dark:text-zinc-400 flex items-center justify-between shrink-0">
          <span>Standard 2.5&quot; x 1.5&quot; or 3&quot; x 2&quot; label sticker compatibility</span>
          <span className="font-mono text-[10px]">Tip: Use &quot;Save as PDF&quot; to generate printable sticker sheets</span>
        </div>
      </div>
    </div>
  );
};
