"use client";
import "./login-styles.css";
import "./login-styles.css";
import Link from "next/link";
import Image from "next/image";
import Cookie from "js-cookie";
import { useState } from "react";
import { API_URL } from "@/constants";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { CheckAdminAPIResponse } from "@/types";
import { CiLock, CiUser } from "react-icons/ci";
import { useTheme } from "@/components/theme-provider";
import { showErrorMessage, showSuccessMessage } from "@/utils";
import { PasswordInput, Button, Divider, TextInput } from "@mantine/core";

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();
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
      let response = await fetch(`${API_URL}/login`, {
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
        response = await fetch(`${API_URL}/admin/check_if_admin`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginResponse.session_token!}`,
          },
        });

        let checkAdminResponse: CheckAdminAPIResponse = await response.json();

        showSuccessMessage("Success", "Logging you in!");
        Cookie.set("token", loginResponse.session_token!);
        Cookie.set("username", loginResponse.name!);
        Cookie.set("isAdmin", checkAdminResponse.isAdmin.toString());
        if (checkAdminResponse.isAdmin) router.push("/admin");
        else router.push("/");
      }
    } catch (error) {
      console.log(error);
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }

    setLoading(false);
  };

  const gradient = {
    background: "linear-gradient(#3B8B5D, #04372C)",
  };

  return (
    <main>
      <div
        className={`flex md:flex-row flex:col w-full h-full items-center md:gap-10 bg-[${
          theme == "dark" ? "#131B23" : "#F1F1F1"
        }]`}
      >
        <div className="w-5/6 h-screen md:flex items-center justify-center hidden">
          <div
            className={`absolute top-7 left-11 h-14 w-36 rounded-3xl shadow-xl bg-white flex items-center justify-center ${
              theme == "dark" ? "gradient--dark-mode" : ""
            }`}
          >
            <h1
              className={`text-xl font-semibold text-${
                theme == "dark" ? "white" : "[#043c31]"
              } text-center leading-10 font-serif`}
            >
              Fit Fusion
            </h1>
          </div>
          <div>
            <Image src="/runner-1.png" alt="Runner Image" width={550} height={380} />
          </div>
        </div>
        <div
          className={`h-screen md:h-[calc(100vh-40px)] w-full md:w-3/5 flex items-center justify-center md:rounded-3xl md:mr-5 ${
            theme == "dark" ? "gradient--dark-mode" : "gradient--light-mode"
          }`}
        >
          <div className="w-96 flex flex-col items-center gap-10 mx-5">
            <h1 className="font-serif text-4xl font-semibold leading-10 text-center text-white">
              Login
            </h1>
            <form className="w-full flex flex-col gap-10 items-center">
              <TextInput
                size="lg"
                type="email"
                placeholder="Email"
                {...form.getInputProps("email")}
                leftSection={<CiUser size={32} />}
                className={`w-full login ${theme == "dark" ? "input--dark-mode" : ""}`}
              />
              <PasswordInput
                size="lg"
                id="login-pwd"
                placeholder="Password"
                leftSection={<CiLock size={32} />}
                {...form.getInputProps("password")}
                className={`w-full login ${theme == "dark" ? "input--dark-mode" : ""}`}
              />
              <div className="flex flex-col justify-center gap-3 mt-10 w-48">
                <Button
                  color="green"
                  onClick={submit}
                  loading={loading}
                  style={{ backgroundColor: "rgb(51, 192, 116, 1)" }}
                  className={`login-button ${
                    theme == "dark" ? "login-button--dark-mode" : ""
                  }`}
                >
                  Login
                </Button>
                <Divider label="or"></Divider>
              </div>
            </form>
            <Link href={"/signup"} className="flex w-full justify-center">
              <Button
                color="white"
                variant="outline"
                className="w-48 h-10 text-lg rounded-2xl -mt-6"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
