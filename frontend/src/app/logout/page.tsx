"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  router.push("/");
  return <h1 className="font-black text-emerald-500 text-2xl ml-5 mt-5">Logout</h1>;
}
