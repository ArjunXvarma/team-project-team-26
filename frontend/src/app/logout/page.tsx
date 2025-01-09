"use client";
import { showErrorMessage } from "@/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from 'react';

function HomeComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "session-expired") {
      showErrorMessage("Session Expired", "You have been logged out.");
    }
    router.push("/login");
  }, []);

  return <h1 className="font-black text-emerald-500 text-2xl ml-5 mt-5">Logout</h1>;
}

export default function Home() {
    <Suspense fallback={<div>Loading...</div>}>
        <HomeComponent />
    </Suspense>
}