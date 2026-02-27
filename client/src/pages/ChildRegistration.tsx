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

const childRegistrationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  age: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(10)),
  classroom: z.string().min(1, "Turma é obrigatória"),
  parentName: z.string().min(1, "Nome do responsável é obrigatório"),
  parentPhone: z.string().min(1, "Telefone é obrigatório"),
  parentEmail: z.string().email("Email inválido"),
  notes: z.string().optional(),
});

type ChildRegistrationForm = z.infer<typeof childRegistrationSchema>;

export default function ChildRegistration() {
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(childRegistrationSchema),
  });

  const createChildMutation = trpc.children.create.useMutation();

  const handleFaceCapture = (embedding: number[], photo: string) => {
    setFaceEmbedding(embedding);
    setPhotoUrl(photo);
    toast.success("Rosto capturado com sucesso!");
  };

  const onSubmit = async (data: any) => {
    if (!faceEmbedding || !photoUrl) {
      toast.error("Por favor, capture o rosto da criança");
      return;
    }

    setIsSubmitting(true);
    try {
      await createChildMutation.mutateAsync({
        name: data.name,
        age: data.age,
        classroom: data.classroom,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail,
        notes: data.notes,
        faceEmbedding,
        photoUrl,
      });

      toast.success("Criança cadastrada com sucesso!");
      reset();
      setFaceEmbedding(null);
      setPhotoUrl(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao cadastrar criança";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cadastro de Crianças</h1>
          <p className="text-gray-600">Registre uma nova criança no sistema com captura facial</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Criança</CardTitle>
              <CardDescription>Preencha os dados básicos da criança</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Criança *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: João Silva"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Idade *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="3"
                      {...register("age")}
                      className={errors.age ? "border-red-500" : ""}
                    />
                    {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="classroom">Turma *</Label>
                    <Input
                      id="classroom"
                      placeholder="Ex: Turma A"
                      {...register("classroom")}
                      className={errors.classroom ? "border-red-500" : ""}
                    />
                    {errors.classroom && <p className="text-sm text-red-500 mt-1">{errors.classroom.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="parentName">Nome do Responsável *</Label>
                  <Input
                    id="parentName"
                    placeholder="Ex: Maria Silva"
                    {...register("parentName")}
                    className={errors.parentName ? "border-red-500" : ""}
                  />
                  {errors.parentName && <p className="text-sm text-red-500 mt-1">{errors.parentName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="parentPhone">Telefone do Responsável *</Label>
                  <Input
                    id="parentPhone"
                    placeholder="Ex: (11) 98765-4321"
                    {...register("parentPhone")}
                    className={errors.parentPhone ? "border-red-500" : ""}
                  />
                  {errors.parentPhone && <p className="text-sm text-red-500 mt-1">{errors.parentPhone.message}</p>}
                </div>

                <div>
                  <Label htmlFor="parentEmail">Email do Responsável *</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="Ex: maria@example.com"
                    {...register("parentEmail")}
                    className={errors.parentEmail ? "border-red-500" : ""}
                  />
                  {errors.parentEmail && <p className="text-sm text-red-500 mt-1">{errors.parentEmail.message}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    placeholder="Ex: Alergia a amendoim"
                    {...register("notes")}
                  />
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
                  disabled={isSubmitting || createChildMutation.isPending}
                  className="w-full"
                >
                  {isSubmitting || createChildMutation.isPending ? "Salvando..." : "Salvar Criança"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Captura Facial */}
          <div>
            <FaceCapture
              onCapture={handleFaceCapture}
              title="Captura Facial da Criança"
              description="Posicione o rosto da criança na câmera"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
