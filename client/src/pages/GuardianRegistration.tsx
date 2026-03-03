import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaceCapture } from "@/components/FaceCapture";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const guardianRegistrationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  relationship: z.string().min(1, "Parentesco é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
});

type GuardianRegistrationForm = z.infer<typeof guardianRegistrationSchema>;

export default function GuardianRegistration() {
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relationship, setRelationship] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(guardianRegistrationSchema),
  });

  const createGuardianMutation = trpc.guardians.create.useMutation();

  const handleFaceCapture = (embedding: number[], photo: string) => {
    setFaceEmbedding(embedding);
    setPhotoUrl(photo);
    toast.success("Rosto capturado com sucesso!");
  };

  const onSubmit = async (data: any) => {
    if (!faceEmbedding || !photoUrl) {
      toast.error("Por favor, capture o rosto do responsável");
      return;
    }

    if (!relationship) {
      toast.error("Por favor, selecione o parentesco");
      return;
    }

    setIsSubmitting(true);
    try {
      await createGuardianMutation.mutateAsync({
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ""),
        relationship,
        phone: data.phone,
        email: data.email,
        faceEmbedding,
        photoUrl,
        isActive: true,
      });

      toast.success("Responsável cadastrado com sucesso!");
      reset();
      setFaceEmbedding(null);
      setPhotoUrl(null);
      setRelationship("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao cadastrar responsável";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cadastro de Responsáveis</h1>
          <p className="text-gray-600">Registre um responsável autorizado com captura facial</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Responsável</CardTitle>
              <CardDescription>Preencha os dados do responsável autorizado</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Maria Silva Santos"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="Ex: 123.456.789-00"
                    {...register("cpf")}
                    className={errors.cpf ? "border-red-500" : ""}
                  />
                  {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf.message}</p>}
                </div>

                <div>
                  <Label htmlFor="relationship">Parentesco *</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pai">Pai</SelectItem>
                      <SelectItem value="mae">Mãe</SelectItem>
                      <SelectItem value="avo">Avó</SelectItem>
                      <SelectItem value="avo_m">Avô</SelectItem>
                      <SelectItem value="tio">Tio</SelectItem>
                      <SelectItem value="tia">Tia</SelectItem>
                      <SelectItem value="irma">Irmã</SelectItem>
                      <SelectItem value="irmao">Irmão</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: (11) 98765-4321"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: maria@example.com"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                {faceEmbedding && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Rosto capturado com sucesso!
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || createGuardianMutation.isPending}
                  className="w-full"
                >
                  {isSubmitting || createGuardianMutation.isPending ? "Salvando..." : "Salvar Responsável"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            <FaceCapture
              onCapture={handleFaceCapture}
              title="Captura Facial do Responsável"
              description="Posicione o rosto do responsável na câmera"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
