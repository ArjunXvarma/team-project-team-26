"use client";
import "@mantine/dates/styles.css";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import Cookie from "js-cookie";
import { useState } from "react";
import { API_URL } from "@/constants";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { useRouter } from "next/navigation";
import { AuthAPIResponse, CheckAdminAPIResponse } from "@/types";
import { PasswordInput, Button, Divider, TextInput } from "@mantine/core";
import { formatDate, showErrorMessage, showSuccessMessage } from "@/utils";

export default function Login() {
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
    background: 'linear-gradient(#3B8B5D, #04372C)'
  };


  return (
    <main>
      <div className="flex md:flex-row flex:col w-full h-full">
        <div className="w-full h-screen md:flex items-center justify-center hidden">
          <Image
            height={400}
            width={600}
            priority={false}
            src="/runner.png"
            alt="Runner Image"
          />
        </div>
        <div className="w-full flex items-center justify-center m-6 rounded-3xl" style={gradient}>
          <div className="w-96 flex flex-col items-center gap-10">
            <h1 className="text-4xl font-black font-serif text-white">Sign Up</h1>
            <form
              className="w-full flex flex-col gap-3 items-center"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="w-full flex gap-3">
                <TextInput
                  required
                  className="w-full"
                  placeholder="First Name"
                  {...form.getInputProps("fname")}
                />
                <TextInput
                  required
                  className="w-full"
                  placeholder="Last Name"
                  {...form.getInputProps("lname")}
                />
              </div>
              <TextInput
                required
                type="email"
                className="w-full"
                placeholder="Email"
                {...form.getInputProps("email")}
              />
              <DateInput
                required
                clearable
                valueFormat="DD MMMM YYYY"
                placeholder="Date of birth"
                style={{ caretColor: "transparent" }}
                className="w-full cursor-pointer"
                onKeyDown={(e) => e.preventDefault()}
                {...form.getInputProps("dob")}
                maxDate={dayjs(new Date()).toDate()}
                minDate={dayjs(new Date(1920, 0, 1)).toDate()}
              />
              <PasswordInput
                required
                className="w-full"
                placeholder="Password"
                {...form.getInputProps("password")}
              />

              <PasswordInput
                required
                placeholder="Confirm Password"
                className="w-full"
                {...form.getInputProps("cpassword")}
              />

              <div className="flex flex-col justify-center gap-3 mt-10 w-48">
                <Button
                  onClick={submit}
                  loading={loading}
                  className="w-full bg-green-700 h-10 text-lg rounded-2xl"
                  style={{ backgroundColor: "rgb(51, 192, 116, 1)" }}
                >
                  Create Account
                </Button>
                <Divider label="or"></Divider>
              </div>
            </form>
            <Link href={"/login"} className="flex w-full justify-center">
              <Button className="w-48 -mt-6 text-lg h-10 rounded-2xl" color="white" variant="outline" onClick={() => {}}>
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
