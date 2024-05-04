"use client";
import "@mantine/dates/styles.css";
import "./signup-styles.css";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import Cookie from "js-cookie";
import { useState } from "react";
import { API_URL } from "@/constants";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { AuthAPIResponse, CheckAdminAPIResponse } from "@/types";
import { PasswordInput, Button, Divider, TextInput } from "@mantine/core";
import { formatDate, showErrorMessage, showSuccessMessage } from "@/utils";
import { CiLock, CiUser } from "react-icons/ci";
import { LuSend } from "react-icons/lu";
import { IoCalendarOutline } from "react-icons/io5";
import { MdAlternateEmail } from "react-icons/md";

export default function Signup() {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { fname: "", lname: "", email: "", password: "", cpassword: "", dob: null },
  });

  const validateForm = () => {
    let exitCode = 0;

    // check first name
    if (form.values.fname.length === 0) {
      form.setFieldError("fname", "First name cannot be empty");
      exitCode = 1;
    }

    // check last name
    if (form.values.lname.length === 0) {
      form.setFieldError("lname", "Last name cannot be empty");
      exitCode = 1;
    }

    // check email
    const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.values.email)) {
      form.setFieldError("email", "Enter a valid email address");
      exitCode = 1;
    }

    // check dob
    if (form.values.dob === null) {
      form.setFieldError("dob", "Enter a valid date of birth");
      exitCode = 1;
    }

    if (form.values.password.length < 5) {
      form.setFieldError("password", "Too Short, Password must be atleast 5 characters long");
      exitCode = 1;
    }

    if (form.values.password !== form.values.cpassword) {
      form.setFieldError("cpassword", "Passwords do not match");
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
      let response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.values.fname,
          last_name: form.values.lname,
          email: form.values.email,
          date_of_birth: formatDate(form.values.dob!),
          password: form.values.password,
        }),
      });

      // email conflits
      if (response.status == 409) {
        form.setFieldError("email", "User with this email already exists");
      }

      const signupResponse: AuthAPIResponse = await response.json();

      if (signupResponse.return_code == 0) {
        showErrorMessage("Error", signupResponse.error!);
      } else {
        showSuccessMessage("Success", "Logging you in!");
        response = await fetch(`${API_URL}/admin/check_if_admin`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${signupResponse.access_token!}`,
          },
        });

        let checkAdminResponse: CheckAdminAPIResponse = await response.json();

        showSuccessMessage("Success", "Logging you in!");
        Cookie.set("token", signupResponse.access_token! as string);
        Cookie.set("username", signupResponse.name! as string);
        Cookie.set("isAdmin", checkAdminResponse.isAdmin.toString());
        router.push("/");
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
        className={`flex md:flex-row flex:col w-full h-full items-center md:gap-10 ${
          theme == "dark" ? "bg-[#131B23]" : "bg-[#F1F1F1]"
        }`}
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
            <Image src="/runner.png" alt="Runner Image" width={550} height={380} />
          </div>
        </div>
        <div
          className={`h-screen md:h-[calc(100vh-40px)] w-full md:w-3/5 flex items-center justify-center md:rounded-3xl md:mr-5 ${
            theme == "dark" ? "gradient--dark-mode" : "gradient--light-mode"
          }`}
        >
          <div className="w-96 flex flex-col items-center gap-10 mx-5">
            <h1 className="font-serif text-4xl font-semibold leading-10 text-center text-white">
              Sign Up
            </h1>
            <form
              className="w-full flex flex-col gap-5 items-center"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="w-full flex gap-3">
                <TextInput
                  required
                  size="md"
                  placeholder="First Name"
                  {...form.getInputProps("fname")}
                  leftSection={<CiUser size={24} />}
                  className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
                />
                <TextInput
                  required
                  size="md"
                  placeholder="Last Name"
                  {...form.getInputProps("lname")}
                  className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
                />
              </div>
              <TextInput
                required
                size="md"
                type="email"
                placeholder="Email"
                {...form.getInputProps("email")}
                leftSection={<MdAlternateEmail size={24} />}
                className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
              />
              <DateInput
                required
                clearable
                size="md"
                valueFormat="DD MMMM YYYY"
                placeholder="Date of birth"
                {...form.getInputProps("dob")}
                maxDate={dayjs(new Date()).toDate()}
                style={{ caretColor: "transparent" }}
                onKeyDown={(e) => e.preventDefault()}
                leftSection={<IoCalendarOutline size={24} />}
                minDate={dayjs(new Date(1920, 0, 1)).toDate()}
                className={`w-full signup cursor-pointer ${
                  theme == "dark" ? "input--dark-mode" : ""
                }`}
              />
              <PasswordInput
                required
                size="md"
                placeholder="Password"
                leftSection={<CiLock size={32} />}
                {...form.getInputProps("password")}
                className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
              />

              <PasswordInput
                required
                size="md"
                placeholder="Confirm Password"
                leftSection={<CiLock size={32} />}
                {...form.getInputProps("cpassword")}
                className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
              />

              <div className="flex flex-col justify-center gap-3 mt-10 w-48">
                <Button
                  color="green"
                  onClick={submit}
                  loading={loading}
                  className={`signup-button ${
                    theme == "dark" ? "singup-button--dark-mode" : ""
                  }`}
                >
                  Create Account
                </Button>
                <Divider label="or"></Divider>
              </div>
            </form>
            <Link href={"/login"} className="flex w-full justify-center">
              <Button
                className="w-48 -mt-6 text-lg h-10 rounded-2xl"
                color="white"
                variant="outline"
                onClick={() => {}}
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
