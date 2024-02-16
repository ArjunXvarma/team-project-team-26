"use client";

import Image from "next/image";
import { useForm } from "@mantine/form";
import { Input, PasswordInput, Button, Divider } from "@mantine/core";

export default function Login() {
  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) =>
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value
        )
          ? null
          : "Invalid email",
      password: (value) => (value.length >= 3 ? null : "Password must be 3 characters long"),
    },
  });
  return (
    <main>
      <div className="flex w-full h-full">
        <div className="w-full h-screen flex items-center justify-center">
          <Image src="/runner.png" alt="Runner Image" width={600} height={400} />
        </div>
        <div className="w-full h-screen flex items-center justify-center bg-primary">
          <div className="w-96 flex flex-col items-center gap-10">
            <h1 className="text-4xl font-black text-white">Login</h1>
            <div className="w-full flex flex-col gap-3">
              <Input
                placeholder="Email"
                type="email"
                className="w-full"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                placeholder="Password"
                className="w-full"
                {...form.getInputProps("password")}
              />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <Button className="bg-secondary" onClick={() => console.log(form)}>
                Login
              </Button>
              <Divider label="or"></Divider>
              <Button color="white" variant="outline">
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
