import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaceCapture } from "@/components/FaceCapture";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

export default function Portaria() {
  const [lastResult, setLastResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const childrenQuery = trpc.children.list.useQuery();
  const guardiansQuery = trpc.guardians.list.useQuery();
  const authorizationsQuery = trpc.authorizations.list.useQuery();
  const createExitLogMutation = trpc.exitLogs.create.useMutation();
  const findMatchMutation = trpc.faceRecognition.findMatch.useQuery({} as any, { enabled: false });
  const getAuthByGuardianMutation = trpc.authorizations.getByGuardian.useQuery(0, { enabled: false });

  const handleFaceCapture = async (embedding: number[], photoUrl: string) => {
    setIsProcessing(true);
    try {
      // Buscar guardians com embeddings
      const guardiansWithEmbeddings = (guardiansQuery.data || []).filter(
        (g) => g.faceEmbedding && g.isActive
      );

      if (guardiansWithEmbeddings.length === 0) {
        toast.error("Nenhum responsável cadastrado com foto facial");
        setIsProcessing(false);
        return;
      }

      // Encontrar melhor match
      const matchResult = await (trpc.faceRecognition.findMatch as any).mutateAsync({
        embedding,
        candidates: guardiansWithEmbeddings.map((g) => ({
          id: g.id,
          embedding: g.faceEmbedding as number[],
        })),
        threshold: 0.6,
      });

      if (!matchResult) {
        setLastResult({
          status: "denied",
          message: "Rosto não reconhecido no sistema",
          confidence: 0,
        });
        toast.error("Rosto não reconhecido");
        setIsProcessing(false);
        return;
      }

      const guardian = guardiansQuery.data?.find((g) => g.id === matchResult.id);
      if (!guardian) {
        setIsProcessing(false);
        return;
      }

      // Buscar autorizações do responsável
      const authorizations = await (trpc.authorizations.getByGuardian as any).mutateAsync(guardian.id);

      if (authorizations.length === 0) {
        setLastResult({
          status: "denied",
          message: `${guardian.name} não tem autorização para buscar crianças`,
          confidence: matchResult.confidence,
          guardian,
        });
        toast.error("Responsável não autorizado");
        setIsProcessing(false);
        return;
      }

      // Registrar saída
      const child = childrenQuery.data?.find((c) => c.id === authorizations[0].childId);

      await createExitLogMutation.mutateAsync({
        childId: authorizations[0].childId,
        guardianId: guardian.id,
        guardianPhotoUrl: photoUrl,
        childPhotoUrl: child?.photoUrl || undefined,
        isAuthorized: true,
        matchConfidence: matchResult.confidence,
        status: "approved",
      });

      setLastResult({
        status: "approved",
        message: `Saída autorizada! ${child?.name} pode sair com ${guardian.name}`,
        confidence: matchResult.confidence,
        guardian,
        child,
      });

      toast.success("Saída autorizada!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar";
      toast.error(errorMessage);
      setLastResult({
        status: "error",
        message: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Portaria - Saída de Crianças</h1>
          <p className="text-gray-600">Reconhecimento facial em tempo real para validação de saídas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Captura Facial */}
          <div>
            <FaceCapture
              onCapture={handleFaceCapture}
              title="Captura Facial"
              description="Posicione o rosto do responsável na câmera"
            />
          </div>

          {/* Resultado */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status da Validação</CardTitle>
                <CardDescription>Resultado do reconhecimento facial</CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Processando reconhecimento facial...</p>
                    </div>
                  </div>
                ) : lastResult ? (
                  <div className="space-y-4">
                    {lastResult.status === "approved" && (
                      <>
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <AlertDescription className="text-green-800 font-semibold">
                            {lastResult.message}
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Responsável</p>
                            <p className="font-semibold text-gray-900">{lastResult.guardian?.name}</p>
                            <p className="text-sm text-gray-600">{lastResult.guardian?.relationship}</p>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Criança</p>
                            <p className="font-semibold text-gray-900">{lastResult.child?.name}</p>
                            <p className="text-sm text-gray-600">Turma: {lastResult.child?.classroom}</p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Confiança do Matching</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${lastResult.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">
                                {(lastResult.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {lastResult.status === "denied" && (
                      <>
                        <Alert variant="destructive">
                          <XCircle className="h-5 w-5" />
                          <AlertDescription className="font-semibold">
                            {lastResult.message}
                          </AlertDescription>
                        </Alert>

                        {lastResult.guardian && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Responsável Detectado</p>
                            <p className="font-semibold text-gray-900">{lastResult.guardian.name}</p>
                            <p className="text-sm text-red-600 mt-2">⚠️ Não autorizado para esta operação</p>
                          </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Confiança do Matching</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${lastResult.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {(lastResult.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {lastResult.status === "error" && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertDescription>{lastResult.message}</AlertDescription>
                      </Alert>
                    )}

                    <Button onClick={() => setLastResult(null)} className="w-full">
                      <Clock className="w-4 h-4 mr-2" />
                      Próxima Validação
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aguardando captura facial...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
