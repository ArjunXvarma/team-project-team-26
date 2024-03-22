"use client";
import Link from "next/link";
import Image from "next/image";
import Cookie from "js-cookie";
import { useState } from "react";
import { API_URL } from "@/constants";
import { useForm } from "@mantine/form";
import { AuthAPIResponse } from "@/types";
import { useRouter } from "next/navigation";
import { PasswordInput, Button, Divider, TextInput } from "@mantine/core";
import { showErrorMessage, showSuccessMessage } from "@/utils";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: "", password: "" },
  });

  const validateForm = () => {
    let exitCode = 0;

    // check email
    const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.values.email)) {
      form.setFieldError("email", "Enter a valid email address");
      exitCode = 1;
    }

    if (form.values.password.length === 0) {
      form.setFieldError("password", "Enter password");
      exitCode = 1;
    }

    return exitCode;
  };

  const submit = async () => {
    setLoading(true);

    if (validateForm() !== 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.values.email,
          password: form.values.password,
        }),
      });

      const loginResponse = await response.json();

      // handle errors
      if (response.status == 404) {
        form.setFieldError("email", loginResponse.error);
      } else if (response.status == 401) {
        form.setFieldError("password", loginResponse.error);
      } else {
        showSuccessMessage("Success", "Logging you in!");
        Cookie.set("token", loginResponse.session_token!);
        Cookie.set("username", loginResponse.name!);
        router.push("/");
      }
    } catch (error) {
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }

    setLoading(false);
  };

  return (
    <main>
      <div className="flex md:flex-row flex:col w-full h-full">
        <div className="w-full h-screen md:flex items-center justify-center hidden">
          <Image src="/runner.png" alt="Runner Image" width={600} height={400} />
        </div>
        <div className="w-full h-screen flex items-center justify-center bg-primary">
          <div className="w-96 flex flex-col items-center gap-10">
            <h1 className="text-4xl font-black text-white">Login</h1>
            <form className="w-full flex flex-col gap-3 items-center">
              <TextInput
                type="email"
                placeholder="Email"
                className="w-full text-white"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                className="w-full"
                placeholder="Password"
                {...form.getInputProps("password")}
              />
              <div className="flex flex-col justify-center gap-3 mt-10 w-48">
                <Button
                  onClick={submit}
                  loading={loading}
                  className="bg-secondary w-full"
                  style={{ backgroundColor: "rgb(51, 192, 116, 1)" }}
                >
                  Login
                </Button>
                <Divider label="or"></Divider>
              </div>
            </form>
            <Link href={"/signup"} className="flex w-full justify-center">
              <Button className="w-48" color="white" variant="outline" onClick={() => {}}>
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
