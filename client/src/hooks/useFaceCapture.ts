import { useRef, useState, useCallback, useEffect } from "react";
import * as faceapi from "@vladmandic/face-api";

interface CaptureResult {
  canvas: HTMLCanvasElement;
  embedding: number[];
  detection: any;
}

interface UseFaceCaptureReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFace: () => Promise<CaptureResult | null>;
  processImage: (image: HTMLImageElement | HTMLVideoElement) => Promise<CaptureResult | null>;
  initializeModels: () => Promise<void>;
}

export function useFaceCapture(): UseFaceCaptureReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modelsLoadedRef = useRef(false);

  // Inicializar modelos de face-api
  const initializeModels = useCallback(async () => {
    if (modelsLoadedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Carregar modelos do face-api
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoadedRef.current = true;
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar modelos de face-api";
      setError(errorMessage);
      console.error("Erro ao inicializar modelos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicializar modelos ao montar
  useEffect(() => {
    initializeModels();
  }, [initializeModels]);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador não suporta acesso à câmera");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao acessar câmera";
      setError(errorMessage);
      console.error("Erro ao iniciar câmera:", err);
    }
  }, []);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Processar imagem (câmera ou arquivo)
  const processImage = useCallback(async (imageElement: HTMLImageElement | HTMLVideoElement): Promise<CaptureResult | null> => {
    try {
      if (!canvasRef.current) {
        throw new Error("Referência de canvas não disponível");
      }

      if (!modelsLoadedRef.current) {
        throw new Error("Modelos de face-api não carregados");
      }

      // Detectar rosto com landmarks e descritor
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        throw new Error("Nenhum rosto detectado. Por favor, tente outra imagem");
      }

      if (detections.length > 1) {
        throw new Error("Múltiplos rostos detectados. Por favor, use uma imagem com apenas um rosto");
      }

      const detection = detections[0];
      const embedding = Array.from(detection.descriptor);

      // Desenhar no canvas
      const canvas = canvasRef.current;
      const displaySize = {
        width: imageElement.width,
        height: imageElement.height,
      };

      faceapi.matchDimensions(canvas, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Limpar e desenhar no canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }

      return {
        canvas,
        embedding,
        detection,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao processar imagem";
      setError(errorMessage);
      console.error("Erro ao processar imagem:", err);
      return null;
    }
  }, []);

  // Capturar rosto
  const captureFace = useCallback(async (): Promise<CaptureResult | null> => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error("Referências de vídeo ou canvas não disponíveis");
      }

      if (!modelsLoadedRef.current) {
        throw new Error("Modelos de face-api não carregados");
      }

      return await processImage(videoRef.current);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao capturar rosto";
      setError(errorMessage);
      console.error("Erro ao capturar rosto:", err);
      return null;
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    isInitialized,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureFace,
    processImage,
    initializeModels,
  };
}
