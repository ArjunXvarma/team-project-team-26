"use client";
import React, { useState, useEffect } from "react";
import "@mantine/dates/styles.css";
import { Button } from "@mantine/core";
import { Modal } from "@mantine/core";
import { Input } from "@mantine/core";
import { FiPlus } from "react-icons/fi";
import { useDisclosure } from "@mantine/hooks";
import { TextInput } from "@mantine/core";
import { IoIosSearch } from "react-icons/io";
import { Select } from "@mantine/core";
import { API_URL } from "@/constants";
import Cookies from "js-cookie";
import { PasswordInput } from "@mantine/core";
import { formatDate, showErrorMessage, showSuccessMessage } from "@/utils";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { DateInput } from "@mantine/dates";
import { AuthAPIResponse } from "@/types";

export default function Admin() {
  const [userData, setUserData] = useState<
    {
      name: String;
      email: String;
      id: String;
      date: String;
      dob: String;
      account_created: String;
      type: String;
      payment_method: String;
    }[]
  >([]);
  const [opened, { open, close }] = useDisclosure(false);

  const filters = ["Membership Type", "Payment Method"];
  const types = ["Basic", "Standard", "Premium"];
  const methods = ["Apple Pay", "Google Pay", "PayPal", "AliPay", "Credit Card"];

  useEffect(() => {
    allMembers();
  }, []);

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

  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);

    if (validateForm() !== 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/create_admin_user`, {
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
        form.setFieldError("email", "User/Admin with this email already exists");
      }

      const createAdminResponse = await response.json();

      if (createAdminResponse.status == 200) {
        showSuccessMessage("Success", "Admin created!");
      } else {
        showErrorMessage("Error", createAdminResponse.error!);
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

  const allMembers = async () => {
    try {
      const token = Cookies.get("token");
      console.log(token);
      const response = await fetch(`${API_URL}/admin/get_all_users`, {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      const memberListResponse = await response.json();

      if (response.status == 200) {
        const usersData = memberListResponse.users.map((user: any) => ({
          name: user.name,
          email: user.email,
          id: user.id,
          dob: user.dob,
          account_created: user.account_created,
          type: user.membership_type,
          payment_method: user.payment_method,
        }));

        setUserData(usersData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [filter, setFilter] = useState<string | null>(null);
  const [type, setType] = useState<string | null>("");
  const [method, setMethod] = useState<string | null>("");

  const remove = async (id: String) => {
    {
      try {
        const token = Cookies.get("token");
        const response = await fetch(`${API_URL}/admin/delete_user/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response);
        const deleteUser = await response.json();

        if (deleteUser.status == 200) {
          showSuccessMessage("Success", deleteUser.message);
          window.location.reload();
        } else {
          showErrorMessage("Error", deleteUser.message!);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const [name, setName] = useState("");
  const [nameOptions, setNameOptions] = useState<{ name: String }[]>([]);
  const fetchOptions = async (inputValue: String) => {
    const len = inputValue.length;
    const op = [];
    for (const i in userData) {
      const name = userData[i].name;
      if (name.substring(0, len).toLowerCase().trim() == inputValue) {
        op.push({ name: name });
      }
    }
    setNameOptions(op);
  };

  return (
    <main>
       <div className="min-h-screen bg-background">
        <div className="h-full m-8 drop-shadow-xl rounded-md bg-white py-4 px-4">
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-10">
            <Select
              placeholder="Filter"
              data={filters}
              value={filter}
              size="md"
              defaultValue={null}
              onChange={setFilter}
              clearable
              className="w-full md:w-auto"
            />
            {filter != null &&
              (filter === filters[0] ? (
                <Select
                  placeholder="Filter Types"
                  data={types}
                  value={type}
                  size="md"
                  onChange={setType}
                  clearable
                  className="w-full md:w-auto"
                />
              ) : (
                <Select
                  placeholder="Filter Methods"
                  data={methods}
                  value={method}
                  size="md"
                  onChange={setMethod}
                  clearable
                  className="w-full md:w-auto"
                />
              ))}
            <TextInput
              value={name}
              placeholder="Search by Name"
              size="md"
              className="w-full md:w-96"
              leftSection={<IoIosSearch size={20} />}
              onChange={(event) => {
                setName(event.target.value);
                fetchOptions(event.target.value);
              }}
            />
            <div className="flex-grow" />
            <div className="justify-self-end">
              <Modal opened={opened} onClose={close} withCloseButton={false} centered>
                <p className="mb-2 text-center text-lg font-semibold">Enter Admin Details</p>
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

                  <div className="flex justify-center mt-4">
                    <Button className="bg-primary" onClick={submit} loading={loading}>
                      Add Admin
                    </Button>
                  </div>
                </form>
              </Modal>
              <Button className="bg-primary rounded-full items-center" onClick={open}>
                Add Admin User <FiPlus className="ml-2" size={20} />
              </Button>
            </div>
          </div>

          <table className="min-w-full flex-shrink bg-white rounded-md">
            <thead className="text-sm font-semibold shad-text-gray-500 dark:shad-text-gray-400">
              <tr className="border-b text-green-900">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Membership Type</th>
                <th className="px-4 py-3 text-left">Payment Method</th>
                <th className="px-12 py-3 text-left">Action</th>
              </tr>
            </thead>

            {filter && (method || type) ? (
              <tbody className="shad-text-gray-500 dark:shad-text-gray-400 text-sm">
                {userData &&
                  userData.map((data, i) => {
                    let renderRow = false;
                    if (filter === "Membership Type" && data.type === type) {
                      renderRow = true;
                    } else if (filter === "Payment Method" && data.payment_method === method) {
                      renderRow = true;
                    }

                    if (renderRow) {
                      return (
                        <tr
                          key={i}
                          className="border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800"
                        >
                          <td className="px-4 py-3 ">{data.name}</td>
                          <td className="px-4 py-3 ">{data.account_created}</td>
                          <td className="px-4 py-3 ">{data.email}</td>
                          <td className="px-4 py-3 ">{data.type}</td>
                          <td className="px-4 py-3 ">{data.payment_method}</td>
                          <td className="px-4 py-3">
                            <Button variant="default" onClick={() => remove(data.id)}>
                              Remove User
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
              </tbody>
            ) : name ? (
              <tbody className="shad-text-gray-500 dark:shad-text-gray-400 text-sm">
                {userData &&
                  userData.map((data, i) => {
                    if (nameOptions.some((option) => option.name === data.name)) {
                      return (
                        <tr
                          key={i}
                          className="border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800"
                        >
                          <td className="px-4 py-3 ">{data.name}</td>
                          <td className="px-4 py-3 ">{data.account_created}</td>
                          <td className="px-4 py-3 ">{data.email}</td>
                          <td className="px-4 py-3 ">{data.type}</td>
                          <td className="px-4 py-3 ">{data.payment_method}</td>
                          <td className="px-4 py-3">
                            <Button variant="default" onClick={() => remove(data.id)}>
                              Remove User
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
              </tbody>
            ) : (
              <tbody className="shad-text-gray-500 dark:shad-text-gray-400 text-sm">
                {userData &&
                  userData.map((data, i) => (
                    <tr
                      key={i}
                      className="border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800"
                    >
                      <td className="px-4 py-3 ">{data.name}</td>
                      <td className="px-4 py-3 ">{data.account_created}</td>
                      <td className="px-4 py-3 ">{data.email}</td>
                      <td className="px-4 py-3 ">{data.type}</td>
                      <td className="px-4 py-3 ">{data.payment_method}</td>
                      <td className="px-4 py-3">
                        <Button variant="default" onClick={() => remove(data.id)}>
                          Remove User
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </main>
  );
}
