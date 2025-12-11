import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle, Share, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Instalar = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <CheckCircle className="h-6 w-6" />
              App Instalado!
            </CardTitle>
            <CardDescription>
              O LC Massoterapia já está instalado no seu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/">Abrir App</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-foreground">Instalar LC Massoterapia</CardTitle>
          <CardDescription>
            Instale o app no seu celular para acesso rápido e uso offline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Como instalar no iPhone/iPad:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">1.</span>
                    <span>
                      Toque no ícone <Share className="inline h-4 w-4" /> (Compartilhar) na barra do Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">2.</span>
                    <span>Role para baixo e toque em "Adicionar à Tela de Início"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">3.</span>
                    <span>Toque em "Adicionar" no canto superior direito</span>
                  </li>
                </ol>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstallClick} className="w-full" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Instalar App
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Como instalar no Android:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">1.</span>
                    <span>
                      Toque no menu <MoreVertical className="inline h-4 w-4" /> do navegador (3 pontos)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">2.</span>
                    <span>Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0">3.</span>
                    <span>Confirme tocando em "Instalar"</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium text-foreground mb-2">Benefícios do App:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Acesso rápido pela tela inicial</li>
              <li>✓ Funciona offline</li>
              <li>✓ Experiência em tela cheia</li>
              <li>✓ Carregamento mais rápido</li>
            </ul>
          </div>

          <Button variant="outline" asChild className="w-full">
            <a href="/">Continuar no Navegador</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Instalar;
