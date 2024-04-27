"use client";
import "@mantine/dates/styles.css";
import dayjs from "dayjs";
import Link from "next/link";
import Cookie from "js-cookie";
import GPXparser from "gpxparser";
import { API_URL } from "@/constants";
import { GrAdd } from "react-icons/gr";
import { useForm } from "@mantine/form";
import { MdLogout } from "react-icons/md";
import { useDisclosure } from "@mantine/hooks";
import { GiPathDistance } from "react-icons/gi";
import { AiOutlineCompass } from "react-icons/ai";
import { DateInput, TimeInput } from "@mantine/dates";
import { ChangeEvent, useEffect, useState } from "react";
import { LiaLongArrowAltRightSolid } from "react-icons/lia";
import { Button, Loader, Modal, Select, TextInput } from "@mantine/core";
import { CreateJourneyAPIResponse, GetJourneyAPIResponse, Journey } from "@/types";
import { formatDate, isValidTime, showErrorMessage, showSuccessMessage } from "@/utils";

export default function Journeys() {
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
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event: ProgressEvent<FileReader>) {
        const rawData = (event.target as FileReader).result;
        if (!rawData) {
          showErrorMessage("Error", "Unable to parse the GPX file.");
          return;
        }
        const gpx = new GPXparser();
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

    // validate name
    if (form.values.name === "") {
      form.setFieldError("name", "Enter a valid name for the journey");
      exitCode = 1;
    }

    // validate type
    if (!validTypes.includes(form.values.type)) {
      form.setFieldError("type", "Select a valid type for the journey");
      exitCode = 1;
    }

    // check time input
    // Parse start and end times
    const [startHour, startMinute] = form.values.startTime.split(":").map(Number);
    const [endHour, endMinute] = form.values.endTime.split(":").map(Number);

    const validStartTime = isValidTime(startHour, startMinute);
    const validEndTime = isValidTime(endHour, endMinute);

    if (!validStartTime) {
      form.setFieldError("startTime", "Enter a valid start time");
      exitCode = 1;
    }

    if (!validEndTime) {
      form.setFieldError("endTime", "Enter a valid end time");
      exitCode = 1;
    }

    if (validStartTime && validEndTime) {
      const startDate = new Date();
      startDate.setHours(startHour, startMinute);

      const endDate = new Date();
      endDate.setHours(endHour, endMinute);

      // Check if start time is before end time
      if (startDate >= endDate) {
        form.setFieldError("endTime", "End time must be after the start time");
        exitCode = 1;
      }
    }

    // validate date
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

    // Get authorization token
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
      console.log(error);
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
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
      console.log(journeyData);
      if (response.status === 404) {
        setJourneys([]);
      } else {
        setJourneys(journeyData.data!);
        [];
      }
    } catch (error) {
      console.log(error);
      showErrorMessage(
        "Server Error",
        "There was a problem contacting the server. Please try again later."
      );
    }

    setGetJourneyLoading(false);
  };

  useEffect(() => {
    getJourneys();
  }, []);
  
  const gradient = {
    background: 'linear-gradient(#3B8B5D, #04372C)'
  };

  return (
    <main>
      <div className="min-h-screen bg-background">
          <div className="flex w-full h-20 items-center px-5">
            <p className="text-center text-lg font-serif flex-grow">
              “Every journey begins with a single step”
            </p>
            <Link href={"/logout"} prefetch={false} className="ml-auto flex items-center">
              <p className="text-xl font-semibold text-green-700 hover:text-green-900 mr-2">Logout</p>
              <MdLogout size={24} color="green" />
            </Link>
          </div> 
              
      <div className="mt-6 flex items-center justify-between mx-10">
        <p className="text-xl">Add a new journey:</p>
        <Button className="bg-primary hover:bg-green-900" leftSection={<GrAdd />} onClick={open}>
          Add
        </Button>
      </div>
      <hr className=" mt-2 mx-10 h-0.5 bg-gray-400 rounded-xl"/>

      {journeys && journeys.length === 0 && (
        <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md border-slate-100 bg-slate-50 text-slate-400">
          <GiPathDistance size={64} />
          <h2 className="text-xs md:text-lg">You haven't taken a journey yet</h2>
        </div>
      )}

      {getJourneyLoading && (
        <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md border-slate-100 bg-slate-50 text-slate-400">
          <Loader size={32} color="gray" />
          <h2 className="text-xs md:text-lg">Loading your journeys</h2>
        </div>
      )}

      <div className="mb-10">
        {journeys &&
          journeys.map((journey, i) => (
            <div
              key={i}

              className="mt-10 gap-5 mx-10 p-5 rounded-3xl bg-white drop-shadow-sharp"
            >
              <Link href={`/journeys/${journey.id}`}>
                <div className="flex justify-between items-center">
                  <div className="flex-col">
                    <h2 className="text-lg font-semibold text-green-800">{journey.name}</h2>
                    <h3 className="mt-3"><span className="font-semibold">Date:</span>  {journey.dateCreated}</h3>
                    <h3> <span className="font-semibold">Distance:</span> {journey.totalDistance.toFixed(2)}m</h3>
                  </div>
                  <LiaLongArrowAltRightSolid size={50} color="green"/>
                </div>
              </Link>
            </div>
          ))}
        </div>

      <Modal opened={opened} onClose={close} title="Upload Journey" size="lg">
        <div className="flex flex-col gap-3">
          <TextInput label="Name" {...form.getInputProps("name")} />
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
            className="w-full cursor-pointer"
            {...form.getInputProps("eventDate")}
            maxDate={dayjs(new Date()).toDate()}
            style={{ caretColor: "transparent" }}
            onKeyDown={(e) => e.preventDefault()}
            minDate={dayjs(new Date(1920, 0, 1)).toDate()}
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
                <input hidden type="file" id="fileInput" onChange={handleFile} accept=".gpx" />
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
