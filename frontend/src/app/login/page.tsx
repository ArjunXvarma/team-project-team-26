"use client";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "@mantine/form";
import { PasswordInput, Button, Divider, TextInput } from "@mantine/core";

export default function Login() {
  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? null
          : "Invalid email",
      password: (value) => {
        if (value.length < 3 || value.length > 20) {
          return "Password length must be between 3-20 characters long.";
        } else {
          return null;
        }
      },
    },
  });

  const submit = form.onSubmit((values) => {
    console.log(values);
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
            <form onClick={submit} className="w-full flex flex-col gap-3 items-center">
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
                <Button className="bg-secondary w-full" type="submit">
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
