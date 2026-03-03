import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFaceCapture } from "@/hooks/useFaceCapture";
import { AlertCircle, Camera, Check, Upload } from "lucide-react";

interface FaceCaptureProps {
  onCapture: (embedding: number[], photoUrl: string) => void;
  title?: string;
  description?: string;
}

export function FaceCapture({
  onCapture,
  title = "Captura Facial",
  description = "Posicione seu rosto na câmera e clique em capturar",
}: FaceCaptureProps) {
  const {
    videoRef,
    canvasRef,
    isInitialized,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureFace,
    processImage,
  } = useFaceCapture();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartCamera = async () => {
    // 1) Renderiza o <video> primeiro
    setIsCameraActive(true);

    // 2) Espera 1 frame para o React montar o DOM e preencher o ref
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    // 3) Agora sim inicia a câmera e anexa no videoRef
    await startCamera();
  };

  const handleStopCamera = () => {
    stopCamera();
    setIsCameraActive(false);
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const result = await captureFace();
      if (result) {
        const imageUrl = result.canvas.toDataURL("image/jpeg");
        setCapturedImage(imageUrl);
        onCapture(result.embedding, imageUrl);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        const img = new Image();
        img.onload = async () => {
          const result = await processImage(img);
          if (result) {
            setCapturedImage(imageUrl);
            onCapture(result.embedding, imageUrl);
          }
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCapturing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Carregando modelos de reconhecimento facial...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao inicializar o sistema de reconhecimento facial. Por favor, recarregue a página.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (capturedImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Foto capturada com sucesso!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={capturedImage} alt="Captura facial" className="rounded-lg max-w-sm max-h-96 object-cover" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Capturar Novamente
              </Button>
              <Button disabled className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Confirmado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ display: "none" }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Câmera desativada</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isCameraActive ? (
              <>
                <Button onClick={handleStartCamera} className="flex-1" size="lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Câmera
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  disabled={isCapturing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Anexar Foto
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            ) : (
              <>
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="flex-1"
                  size="lg"
                >
                  {isCapturing ? "Capturando..." : "Capturar Foto"}
                </Button>
                <Button onClick={handleStopCamera} variant="outline" size="lg">
                  Parar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
