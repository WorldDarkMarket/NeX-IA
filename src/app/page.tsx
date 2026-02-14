import { redirect } from "next/navigation";

// Redirect para o HTML estático - preserva 100% do frontend intacto
export default function Home() {
  redirect("/nex.html");
}
