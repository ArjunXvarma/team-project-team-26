"use client";

import "@mantine/dates/styles.css";
import "./journey-styles.css";
import dayjs from "dayjs";
import Link from "next/link";
import Cookie from "js-cookie";
import dynamic from "next/dynamic";
import { API_URL } from "@/constants";
import { GrAdd } from "react-icons/gr";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { GiPathDistance } from "react-icons/gi";
import { AiOutlineCompass } from "react-icons/ai";
import { DateInput, TimeInput } from "@mantine/dates";
import { useTheme } from "@/components/theme-provider";
import { ChangeEvent, useEffect, useState } from "react";
import { LiaLongArrowAltRightSolid } from "react-icons/lia";
import { Button, Loader, Modal, Select, TextInput } from "@mantine/core";
import { CreateJourneyAPIResponse, GetJourneyAPIResponse, Journey } from "@/types";
import { formatDate, isValidTime, showErrorMessage, showSuccessMessage } from "@/utils";

// Dynamic import for GPXparser
let GPXparser: any;
if (typeof window !== "undefined") {
  // Import GPXparser dynamically when in the browser
  GPXparser = require("gpxparser");
}

// export const dynamic = "force-dynamic";

export default function Journeys() {
  const { theme } = useTheme();
  const validTypes = ["Run", "Walk", "Cycle"];
  const [gpxLoading, setGPXLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [getJourneyLoading, setGetJourneyLoading] = useState(true);
  const [createJourneyLoading, setCreateJourneyLoading] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState<{
    type: "success" | "error";
    msg: String;
  } | null>();

  const form = useForm({
    initialValues: {
      name: "",
      type: "",
      points: [],
      endTime: "",
      startTime: "",
      eventDate: null,
      totalDistance: -1,
      elevation: { min: -1, max: -1, avg: -1 },
    },
  });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    setGPXLoading(true);
    setFileUploadStatus(null);
  
    if (e.target.files === null || e.target.files.length === 0) {
      setGPXLoading(false);
      setFileUploadStatus({ type: "error", msg: "Please upload a valid GPX file" });
      return;
    }
  
    let file: File = e.target.files[0];
    if (file && typeof window !== "undefined") {
      const reader = new FileReader();
      reader.onload = function (event: ProgressEvent<FileReader>) {
        const rawData = (event.target as FileReader).result;
        if (!rawData) {
          showErrorMessage("Error", "Unable to parse the GPX file.");
          return;
        }
        const gpx = new GPXparser(); // Initialize GPXparser dynamically
        gpx.parse(rawData as string);
        const track = gpx.tracks[0];
        form.setFieldValue("elevation", {
          min: track.elevation.min,
          max: track.elevation.max,
          avg: track.elevation.avg,
        });
        form.setFieldValue("totalDistance", track.distance.total);
        form.setFieldValue(
          "points",
          // @ts-ignore
          track.points.map((val) => ({ lat: val.lat, lon: val.lon, ele: val.ele } as never))
        );
      };
      reader.readAsText(file);
    }
  
    setFileUploadStatus({ type: "success", msg: "File Uploaded" });
    setGPXLoading(false);
  };
  

  const validateForm = () => {
    let exitCode = 0;

    // Validate name
    if (form.values.name === "") {
      form.setFieldError("name", "Enter a valid name for the journey");
      exitCode = 1;
    }

    // Validate type
    if (!validTypes.includes(form.values.type)) {
      form.setFieldError("type", "Select a valid type for the journey");
      exitCode = 1;
    }

    // Validate times
    const [startHour, startMinute] = form.values.startTime.split(":").map(Number);
    const [endHour, endMinute] = form.values.endTime.split(":").map(Number);

    if (!isValidTime(startHour, startMinute)) {
      form.setFieldError("startTime", "Enter a valid start time");
      exitCode = 1;
    }

    if (!isValidTime(endHour, endMinute)) {
      form.setFieldError("endTime", "Enter a valid end time");
      exitCode = 1;
    }

    // Ensure start time is before end time
    if (isValidTime(startHour, startMinute) && isValidTime(endHour, endMinute)) {
      const startDate = new Date();
      startDate.setHours(startHour, startMinute);

      const endDate = new Date();
      endDate.setHours(endHour, endMinute);

      if (startDate >= endDate) {
        form.setFieldError("endTime", "End time must be after the start time");
        exitCode = 1;
      }
    }

    // Validate date
    if (form.values.eventDate === null) {
      form.setFieldError("eventDate", "Enter a valid date");
      exitCode = 1;
    }

    if (form.values.points.length === 0) {
      setFileUploadStatus({ type: "error", msg: "Please upload a valid GPX file" });
      exitCode = 1;
    }

    return exitCode;
  };

  const createJourney = async () => {
    setCreateJourneyLoading(true);

    if (validateForm() !== 0) {
      setCreateJourneyLoading(false);
      return;
    }

    const token = Cookie.get("token");
    try {
      const response = await fetch(`${API_URL}/create_journey`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form.values,
          endTime: `${form.values.endTime}:00`,
          startTime: `${form.values.startTime}:00`,
          dateCreated: formatDate(form.values.eventDate!),
        }),
      });

      const data: CreateJourneyAPIResponse = await response.json();

      if (response.status === 400) {
        showErrorMessage("Error", data.message);
      } else {
        showSuccessMessage("Success", data.message);
        getJourneys();
        close();
      }
    } catch (error) {
      showErrorMessage("Server Error", "There was a problem contacting the server.");
    }

    setCreateJourneyLoading(false);
  };

  const getJourneys = async () => {
    setGetJourneyLoading(true);

    const token = Cookie.get("token");
    try {
      const response = await fetch(`${API_URL}/get_journeys_of_user`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const journeyData: GetJourneyAPIResponse = await response.json();
      if (response.status === 404) {
        setJourneys([]);
      } else {
        setJourneys(journeyData.data!);
      }
    } catch (error) {
      showErrorMessage("Server Error", "There was a problem contacting the server.");
    }

    setGetJourneyLoading(false);
  };

  useEffect(() => {
    getJourneys();
  }, []);

  return (
    <main>
      <div
        className={`min-h-[100vh] ${theme === "dark" ? "bg-dk_background" : "bg-background"}`}
      >
        <div
          onClick={open}
          className={`fixed bottom-5 right-5 z-10 w-16 h-16 rounded-full flex items-center justify-center text-white cursor-pointer ${
            theme == "dark" ? "gradient--dark-mode " : "gradient--light-mode "
          }`}
        >
          <GrAdd size={24} />
        </div>

        {journeys && journeys.length === 0 && (
          <div
            className={`flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md ${
              theme === "dark"
                ? "border-green-200 bg-[#1B2733] text-green-400"
                : "border-slate-100 bg-slate-50 text-slate-400"
            }`}
          >
            <GiPathDistance size={64} />
            <h2 className="text-xs md:text-lg">You haven&apos;t taken a journey yet</h2>
          </div>
        )}

        {getJourneyLoading && (
          <div
            className={`flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md ${
              theme === "dark"
                ? "border-[#5FE996] bg-[#1B2733] text-green-400"
                : "border-slate-100 bg-slate-50 text-slate-400"
            }`}
          >
            <Loader size={32} color="gray" />
            <h2 className="text-xs md:text-lg">Loading your journeys</h2>
          </div>
        )}
        {journeys && journeys.length > 0 ? (
          <div className="w-full flex justify-end mr-10 ">
            <Link href={"/journeys/view-all"}>
              <Button className="gradient--dark-mode text-white">View All</Button>
            </Link>
          </div>
        ) : (
          <></>
        )}

        <div className="mb-10">
          {journeys &&
            journeys.map((journey, i) => (
              <div
                key={i}
                className={`mt-10 gap-5 mx-10 p-5 rounded-3xl drop-shadow-sharp ${
                  theme === "dark" ? "bg-[#1B2733]" : "bg-white"
                }`}
              >
                <Link href={`/journeys/${journey.id}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-col">
                      <h2
                        className={`text-lg font-semibold  ${
                          theme == "dark" ? "text-[#5FE996]" : "text-green-800"
                        }`}
                      >
                        {journey.name}
                      </h2>
                      <h3 className={`mt-3 ${theme == "dark" ? "text-white" : "text-black"}`}>
                        <span className="font-semibold">Date:</span> {journey.dateCreated}
                      </h3>
                      <h3 className={`mt-3 ${theme == "dark" ? "text-white" : "text-black"}`}>
                        <span className="font-semibold">Distance:</span>{" "}
                        {journey.totalDistance.toFixed(2)}m
                      </h3>
                    </div>
                    <LiaLongArrowAltRightSolid size={50} color="green" />
                  </div>
                </Link>
              </div>
            ))}
        </div>

        <Modal
          size="lg"
          opened={opened}
          onClose={close}
          title="Upload Journey"
          className={`${theme == "dark" ? "modal" : ""}`}
        >
          <div className="flex flex-col gap-3">
            <TextInput
              label="Name"
              color="#aaa"
              {...form.getInputProps("name")}
              className={`w-full ${theme == "dark" ? "input--dark-mode" : ""}`}
            />
            <Select label="Type" data={validTypes} {...form.getInputProps("type")} />
            <div className="flex justify-between gap-5">
              <TimeInput
                label="Start Time"
                className="w-full"
                {...form.getInputProps("startTime")}
              />
              <TimeInput
                label="End Time"
                className="w-full"
                {...form.getInputProps("endTime")}
              />
            </div>
            <DateInput
              required
              clearable
              label="Event Date"
              valueFormat="DD MMMM YYYY"
              {...form.getInputProps("eventDate")}
              maxDate={dayjs(new Date()).toDate()}
              style={{ caretColor: "transparent" }}
              onKeyDown={(e) => e.preventDefault()}
              minDate={dayjs(new Date(1920, 0, 1)).toDate()}
              className={`w-full cursor-pointer ${theme == "dark" ? "input--dark-mode" : ""}`}
            />
            <label htmlFor="fileInput" className="mt-5">
              <p>Upload GPX (.gpx) File</p>
              {fileUploadStatus ? (
                <p
                  className={`text-xs class text-${
                    fileUploadStatus.type == "error" ? "[#FA5252]" : "primary"
                  }`}
                >
                  {fileUploadStatus.msg}
                </p>
              ) : null}
              <div className="mt-2 flex items-center gap-3">
                {gpxLoading && <Loader size="sm" color="green" />}
                <div className="bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white font-medium flex gap-2 w-fit items-center p-2 rounded">
                  <AiOutlineCompass size={24} />
                  <p className="">Upload File</p>
                  <input
                    hidden
                    type="file"
                    id="fileInput"
                    onChange={handleFile}
                    accept=".gpx"
                  />
                </div>
              </div>
            </label>
          </div>
          <Button
            onClick={createJourney}
            loading={createJourneyLoading}
            className="bg-primary hover:bg-hover text-white mt-5 w-full"
          >
            Save Journey
          </Button>
        </Modal>
      </div>
    </main>
  );
}
