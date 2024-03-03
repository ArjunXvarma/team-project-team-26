"use client";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import "@mantine/dates/styles.css";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { PasswordInput, Button, Divider, TextInput } from "@mantine/core";

export default function Login() {
  const form = useForm({
    initialValues: { fname: "", lname: "", email: "", password: "", cpassword: "", dob: "" },
    validate: {
      fname: (value) => (value.length !== 0 ? null : "Enter first name"),
      lname: (value) => (value.length !== 0 ? null : "Enter last name"),
      email: (value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? null
          : "Invalid email",
      password: (value) => {
        if (value.length < 3) {
          return "Password too short";
        } else if (value.length > 20) {
          return "Password too long";
        } else {
          null;
        }
      },
    },
  });

  const submit = form.onSubmit((values) => {
    console.log(form.errors);
    console.log("submit");
  });

  return (
    <main>
      <div className="flex w-full h-full">
        <div className="w-full h-screen flex items-center justify-center">
          <Image src="/runner.png" alt="Runner Image" width={600} height={400} />
        </div>
        <div className="w-full h-screen flex items-center justify-center bg-primary">
          <div className="w-96 flex flex-col items-center gap-10">
            <h1 className="text-4xl font-black text-white">Sign Up</h1>
            <form onClick={submit} className="w-full flex flex-col gap-3 items-center">
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
                type="email"
                className="w-full"
                placeholder="Email"
                {...form.getInputProps("email")}
              />
              <DateInput
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
                placeholder="Password"
                className="w-full"
                {...form.getInputProps("password")}
              />
              {form.values.password.length < 1 || form.errors.password ? null : (
                <PasswordInput placeholder="Confirm Password" className="w-full" />
              )}
              <div className="flex flex-col justify-center gap-3 mt-10 w-48">
                <Button
                  type="submit"
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
