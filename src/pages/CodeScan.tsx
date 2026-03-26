import React, { useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

// Définition de l'interface pour les props
interface BarreCodeScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
}

const BarreCodeScanner = ({ onScanSuccess }: BarreCodeScannerProps) => {
  useEffect(() => {
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.ITF,
    ];

    const config = {
      fps: 15,
      qrbox: {
        width: 300,
        height: 150, 
      },
      formatsToSupport: formatsToSupport,
      aspectRatio: 1.777778,
      experimentalFeatures:{
        useBarCodeDetectorIfSupported: true
      },
      rememberLastUsedCamera: true,
    };

    const scanner = new Html5QrcodeScanner("barcode-reader", config, false);
    
    scanner.render(onScanSuccess, (error) => {
      
    });

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
      <div id="barcode-reader" className="overflow-hidden rounded-xl"></div>
      <p className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400">
        Placez le code-barres dans le cadre pour le scanner automatiquement.
      </p>
    </div>
  );
};

export default BarreCodeScanner;