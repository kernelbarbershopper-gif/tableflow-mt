import React, { useEffect, useState } from 'react';
import { Download, Smartphone, ExternalLink, X, Check, AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

interface AppInstallPromptProps {
  onClose?: () => void;
}

export default function AppInstallPrompt({ onClose }: AppInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [apkUrl, setApkUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());

    if (Capacitor.isNativePlatform()) {
      setShowPrompt(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const checkForge getLatestApkUrl();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const getLatestApkUrl = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/kernelbarbershopper-gif/tableflow-mt/actions/artifacts', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      const data = await response.json();
      const debugArtifact = data.artifacts?.find((a: any) => a.name === 'app-debug-apk');
      if (debugArtifact) {
        const artifactResponse = await fetch(debugArtifact.archive_download_url, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN || ''}` }
        });
        if (artifactResponse.ok) {
          const blob = await artifactResponse.blob();
          setApkUrl(URL.createObjectURL(blob));
        }
      }
    } catch (e) {
      console.log('APK not available via API, using fallback');
      setApkUrl('https://github.com/kernelbarbershopper-gif/tableflow-mt/actions/artifacts');
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleOpenNative = () => {
    if (Capacitor.isNativePlatform()) return;
    
    const url = 'tableflowmt://';
    const fallbackUrl = 'https://github.com/kernelbarbershopper-gif/tableflow-mt/actions/artifacts';
    
    const start = Date.now();
    window.location.href = url;
    
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href = fallbackUrl;
      }
    }, 1500);
  };

  const handleDownloadAPK = () => {
    if (apkUrl) {
      const a = document.createElement('a');
      a.href = apkUrl;
      a.download = 'tableflow-mt.apk';
      a.click();
    } else {
      window.open('https://github.com/kernelbarbershopper-gif/tableflow-mt/actions/artifacts', '_blank');
    }
  };

  if (!showPrompt || isNative) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">TableFlow MT App</h3>
                <p className="text-amber-100 text-sm">Instale no celular para acesso rápido</p>
              </div>
            </div>
            <button onClick={() => { setShowPrompt(false); onClose?.(); }} className="text-white/80 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleInstallPWA}
              className="bg-amber-800 hover:bg-amber-900 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition cursor-pointer"
            >
              <Download className="h-6 w-6" />
              <span className="font-bold text-sm">Instalar PWA</span>
              <span className="text-xs text-amber-200">Add à tela inicial</span>
            </button>

            <button
              onClick={handleDownloadAPK}
              className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition cursor-pointer border border-slate-700"
            >
              <Smartphone className="h-6 w-6" />
              <span className="font-bold text-sm">Baixar APK</span>
              <span className="text-xs text-slate-400">Android nativo</span>
            </button>
          </div>

          <button
            onClick={handleOpenNative}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ExternalLink className="h-5 w-5" />
            Abrir App Nativo (se instalado)
          </button>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">APK requer "Fontes desconhecidas"</p>
                <p className="mt-1">Configurações → Segurança → Permitir desta fonte → Chrome/Arquivos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}