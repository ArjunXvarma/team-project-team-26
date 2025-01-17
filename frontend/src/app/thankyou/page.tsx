"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Image, Button } from "@mantine/core";
import { IoFootsteps } from "react-icons/io5";
import { useTheme } from "@/components/theme-provider";

export default function Thankyou() {
  const { theme } = useTheme();
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(Cookies.get("username")!);
  }, []);

  return (
    <main
      className={`w-screen h-screen relative ${
        theme == "dark" ? "bg-dk_background" : "bg-tertiary"
      }`}
    >
      <div className="flex justify-center p-28 ">
        <div
          className={`rounded-3xl shadow-xl flex-col text-center p-28 relative z-10 ${
            theme == "dark" ? "bg-[#1B2733] text-white" : "bg-white"
          }`}
        >
          <h1 className=" text-4xl font-semibold">Congratulations {username}!</h1>
          <h2 className=" text-4xl font-semibold mt-4 mb-20">You are now a member</h2>
          <div className="mt-5">
            <Link href={"/dashboard"}>
              <Button
                className="text-white gradient--dark-mode"
                style={{
                  background:
                    "linear-gradient(180deg, #2f7149 0%, #044e40 89.81%, #043429 100%);",
                }}
              >
                View dashboard
              </Button>
            </Link>
          </div>
          <IoFootsteps
            size={150}
            color={theme == "dark" ? "#5FE996" : "#000"}
            className="absolute top-2 right-0 transform translate-x-1/2 -translate-y-1/2 -rotate-45"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-0">
          <Image
            width={"100vw"}
            src="/plant2.png"
            alt="Assorted green plants arranged in a garden bed."
          />
        </div>
      </div>
    </main>
  );
}
