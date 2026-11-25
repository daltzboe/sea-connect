import { redirect } from "next/navigation";

export default function SignUpDisabled() {
  redirect("/signin");
}
