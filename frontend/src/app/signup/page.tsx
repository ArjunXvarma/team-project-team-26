"use client";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import "@mantine/dates/styles.css";
import { API_URL } from "@/constants";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { PasswordInput, Button, Divider, TextInput } from "@mantine/core";
import { BiSolidError } from "react-icons/bi";

export default function Login() {
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

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const submit = async () => {
    if (validateForm() !== 0) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        body: JSON.stringify({
          first_name: form.values.fname,
          last_name: form.values.lname,
          email: form.values.email,
          date_of_birth: formatDate(form.values.dob!),
          password: form.values.password,
        }),
      });

      const signupResponse = await response.json();
      console.log(signupResponse);
      console.log(response.status);
    } catch (error) {
      console.log(error);
      notifications.show({
        color: "red",
        title: "Server Error",
        icon: <BiSolidError />,
        message: "There was a problem contacting the server. Please try again later.",
      });
    }
  };

  return (
    <main>
      <div className="flex md:flex-row flex:col w-full h-full">
        <div className="w-full h-screen md:flex items-center justify-center hidden">
          <Image src="/runner.png" alt="Runner Image" width={600} height={400} />
        </div>
        <div className="w-full h-screen flex items-center justify-center bg-primary">
          <div className="w-96 flex flex-col items-center gap-10">
            <h1 className="text-4xl font-black text-white">Sign Up</h1>
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
                placeholder="Date input"
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
                  className="w-full"
                  style={{ backgroundColor: "rgb(51, 192, 116, 1)" }}
                >
                  Create Account
                </Button>
                <Divider label="or"></Divider>
              </div>
            </form>
            <Link href={"/login"} className="flex w-full justify-center">
              <Button className="w-48" color="white" variant="outline" onClick={() => {}}>
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
