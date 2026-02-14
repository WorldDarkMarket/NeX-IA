import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Garantir sessão antes de acessar o studio
export default async function StudioPage() {
  // Verificar sessão (criada via middleware)
  const session = await getSession();

  // Redirecionar para HTML estático
  redirect("/studio.html");
}
