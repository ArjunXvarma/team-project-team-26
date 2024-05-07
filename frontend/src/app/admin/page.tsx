"use client";
import "./admin-styles.css";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import "@mantine/dates/styles.css";
import { API_URL } from "@/constants";
import { FiPlus } from "react-icons/fi";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { IoIosSearch } from "react-icons/io";
import { useDisclosure } from "@mantine/hooks";
import React, { useState, useEffect } from "react";
import { Button, Modal, Select, PasswordInput, TextInput, Pagination } from "@mantine/core";
import { formatDate, showErrorMessage, showSuccessMessage } from "@/utils";
import { useTheme } from "@/components/theme-provider";
import { CiLock, CiUser } from "react-icons/ci";
import { MdAlternateEmail } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";

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

  const { theme } = useTheme();
  const types = ["Basic", "Standard", "Premium"];
  const [opened, { open, close }] = useDisclosure(false);
  const filters = ["Membership Type", "Payment Method"];
  const methods = ["Apple Pay", "Google Pay", "PayPal", "AliPay", "Credit Card"];
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    allMembers(1);
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
      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/admin/create_admin_user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
        form.reset();
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

  const allMembers = async (page: number) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/admin/get_all_users?per_page=10&page=${page}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const memberListResponse = await response.json();

      if (response.status == 200) {
        setPagination({ page: 1, totalPages: memberListResponse.total_pages });
        const usersData = memberListResponse.users.map((user: any) => ({
          name: user.name,
          email: user.email,
          id: user.id,
          dob: user.dob,
          account_created: user.account_created,
          type: user.membership_type,
          payment_method: user.payment_method,
        }));

        // Add padding
        const numberOfMissingUsers = Math.max(10 - usersData.length, 0);
        for (let i = 0; i < numberOfMissingUsers; i++) {
          usersData.push({
            name: "",
            email: "",
            id: "",
            dob: "",
            account_created: "",
            type: "",
            payment_method: "",
          });
        }

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
          headers: { " Authorization": `Bearer ${token}` },
        });

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
      <div
        className={`min-h-screen ${
          theme == "dark" ? "bg-dk_background text-white" : "bg-background"
        }`}
      >
        <div
          className={`h-full m-8  rounded-3xl p-5 drop-shadow-sharp ${
            theme == "dark" ? "bg-[#1B2733]" : "bg-white"
          }`}
        >
          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-10">
            <Select
              size="md"
              clearable
              data={filters}
              value={filter}
              placeholder="Filter"
              defaultValue={null}
              onChange={setFilter}
              className={`w-full md:w-auto  ${theme == "dark" ? "dark-select" : ""}`}
            />
            {filter != null &&
              (filter === filters[0] ? (
                <Select
                  size="md"
                  clearable
                  data={types}
                  value={type}
                  onChange={setType}
                  placeholder="Filter Types"
                  className={`w-full md:w-auto  ${theme == "dark" ? "dark-select" : ""}`}
                />
              ) : (
                <Select
                  size="md"
                  clearable
                  data={methods}
                  value={method}
                  onChange={setMethod}
                  placeholder="Filter Methods"
                  className={`w-full md:w-auto  ${theme == "dark" ? "dark-select" : ""}`}
                />
              ))}
            <TextInput
              value={name}
              size="md"
              placeholder="Search by Name"
              leftSection={<IoIosSearch size={20} />}
              onChange={(event) => {
                setName(event.target.value);
                fetchOptions(event.target.value);
              }}
              className={`w-full md:w-96 search ${theme == "dark" ? "search--dark-mode" : ""}`}
            />
            <div className="flex-grow" />
            <div className="justify-self-end">
              <Modal
                size={"lg"}
                centered
                opened={opened}
                onClose={close}
                withCloseButton={false}
                className={`${theme == "dark" ? "dark-modal" : ""}`}
              >
                <p className="mb-2 text-center text-lg font-semibold">Enter Admin Details</p>
                <form
                  className="w-full flex flex-col gap-5 items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="w-full flex gap-5">
                    <TextInput
                      required
                      placeholder="First Name"
                      {...form.getInputProps("fname")}
                      leftSection={<CiUser size={24} />}
                      className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
                    />
                    <TextInput
                      required
                      placeholder="Last Name"
                      {...form.getInputProps("lname")}
                      className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
                    />
                  </div>
                  <TextInput
                    required
                    type="email"
                    placeholder="Email"
                    {...form.getInputProps("email")}
                    leftSection={<MdAlternateEmail size={24} />}
                    className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
                  />
                  <DateInput
                    required
                    clearable
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
                    placeholder="Password"
                    leftSection={<CiLock size={32} />}
                    {...form.getInputProps("password")}
                    className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
                  />

                  <PasswordInput
                    required
                    placeholder="Confirm Password"
                    leftSection={<CiLock size={32} />}
                    {...form.getInputProps("cpassword")}
                    className={`w-full signup ${theme == "dark" ? "input--dark-mode" : ""}`}
                  />

                  <div className="flex justify-center mt-4">
                    <Button
                      style={{
                        background:
                          "linear-gradient(180deg, #2f7149 0%, #044e40 89.81%, #043429 100%);",
                      }}
                      onClick={submit}
                      loading={loading}
                    >
                      Add Admin
                    </Button>
                  </div>
                </form>
              </Modal>
              <Button
                onClick={open}
                className="gradient--dark-mode rounded-full items-center drop-shadow-sharp"
                style={{
                  background:
                    "linear-gradient(180deg, #2f7149 0%, #044e40 89.81%, #043429 100%);",
                }}
              >
                Add Admin User <FiPlus className="ml-2" size={20} />
              </Button>
            </div>
          </div>

          <table className="min-w-full flex-shrink rounded-md overflow-scroll">
            <thead className="font-semibold shad-text-gray-500 dark:shad-text-gray-400">
              <tr
                className={`border-b-2 ${
                  theme == "dark" ? "text-[#5FE996] border-[#787878]" : "text-green-900"
                }`}
              >
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
                          className={`border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800 h-16 ${
                            theme == "dark" ? "border-[#787878]" : ""
                          }`}
                        >
                          <td className="px-4 py-3 ">{data.name}</td>
                          <td className="px-4 py-3 ">{data.account_created}</td>
                          <td className="px-4 py-3 ">{data.email}</td>
                          <td className="px-4 py-3 ">{data.type}</td>
                          <td className="px-4 py-3 ">{data.payment_method}</td>
                          <td className="px-4 py-3">
                            {data.id && (
                              <Button
                                variant="default"
                                onClick={() => remove(data.id)}
                                className={`${theme == "dark" ? "dark-button" : ""}`}
                              >
                                Remove User
                              </Button>
                            )}
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
                          className={`border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800 h-16 ${
                            theme == "dark" ? "border-[#787878]" : ""
                          }`}
                        >
                          <td className="px-4 py-3">{data.name}</td>
                          <td className="px-4 py-3">{data.account_created}</td>
                          <td className="px-4 py-3">{data.email}</td>
                          <td className="px-4 py-3">{data.type}</td>
                          <td className="px-4 py-3">{data.payment_method}</td>
                          <td className="px-4 py-3">
                            {data.id && (
                              <Button
                                variant="default"
                                onClick={() => remove(data.id)}
                                className={`${theme == "dark" ? "dark-button" : ""}`}
                              >
                                Remove User
                              </Button>
                            )}
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
                      className={`border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800 h-16 ${
                        theme == "dark" ? "border-[#787878]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 ">{data.name}</td>
                      <td className="px-4 py-3 ">{data.account_created}</td>
                      <td className="px-4 py-3 ">{data.email}</td>
                      <td className="px-4 py-3 ">{data.type}</td>
                      <td className="px-4 py-3 ">{data.payment_method}</td>
                      <td className="px-4 py-3">
                        {data.id && (
                          <Button
                            variant="default"
                            onClick={() => remove(data.id)}
                            className={`${theme == "dark" ? "dark-button" : ""}`}
                          >
                            Remove User
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
          <div className="w-full flex justify-center mt-10">
            <Pagination
              color="green"
              total={pagination.totalPages}
              onChange={(val) => {
                setPagination((prev) => ({ ...prev, page: val }));
                allMembers(val);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
