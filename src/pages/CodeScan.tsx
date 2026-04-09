import React, { useEffect } from 'react';
import { Html5QrcodeScanner, type Html5QrcodeResult } from "html5-qrcode";
import { Html5QrcodeSupportedFormats, type Html5QrcodeError } from 'html5-qrcode/esm/core';

// Définition de l'interface pour les props
interface BarreCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  // Optionnel : un callback pour la fermeture ou l'erreur, si besoin
  onScanFailure?: (error: Html5QrcodeError) => void;
}

// Le composant est enveloppé dans React.memo pour éviter les re-rendus inutiles.
// Il ne se mettra à jour que si `onScanSuccess` ou `onScanFailure` changent.
const BarreCodeScanner = React.memo(({ onScanSuccess, onScanFailure }: BarreCodeScannerProps) => {

  useEffect(() => {
    // Configuration optimisée du scanner
    const config = {
      fps: 10, // 10 images par seconde est suffisant pour un scan fluide
      qrbox: {
        width: 250,
        height: 150, 
      },
      supportedScanTypes: [], // Pour utiliser tous les types de scan disponibles
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      rememberLastUsedCamera: true,
    };

    // Initialisation du scanner
    const html5QrcodeScanner = new Html5QrcodeScanner("barcode-reader", config, false);

    // Wrapper pour la fonction de succès
    const handleSuccess = (decodedText: string) => {
      // On s'assure que la fonction passée en prop est bien appelée.
      onScanSuccess(decodedText);
      // On arrête immédiatement le scanner après un succès pour éviter les multi-scans
      html5QrcodeScanner.clear().catch(error => {
          console.error("Impossible de nettoyer le scanner après succès.", error);
      });
    };

    // Wrapper pour la fonction d'échec
    const handleError = (error: Html5QrcodeError) => {
        // La plupart du temps, on peut ignorer les erreurs de type "QR code not found"
        // Si un vrai callback d'erreur est fourni, on l'appelle.
        if (onScanFailure) {
            onScanFailure(error);
        }
    };

    // Démarrage du rendu du scanner
    html5QrcodeScanner.render(handleSuccess, handleError);

    // Fonction de nettoyage exécutée lorsque le composant est démonté
    return () => {
      // S'assurer que le scanner est bien arrêté et la caméra libérée
      if (html5QrcodeScanner.getState() === 2) { // 2 = SCANNING
         html5QrcodeScanner.clear().catch((error) => {
            console.error("Échec du nettoyage de html5QrcodeScanner.", error);
         });
      }
    };
    
    // La dépendance `onScanSuccess` est voulue, mais c'est au composant parent
    // de nous fournir une fonction stable grâce à `useCallback`.
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
      <div id="barcode-reader" className="w-full overflow-hidden rounded-xl"></div>
      <p className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400">
        Placez le code-barres dans le cadre pour le scanner.
      </p>
    </div>
  );
});

export default BarreCodeScanner;
