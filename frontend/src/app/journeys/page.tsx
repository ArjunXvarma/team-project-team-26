"use client";
import "@mantine/dates/styles.css";
import Cookie from "js-cookie";
import router from "next/router";
import GPXparser from "gpxparser";
import { API_URL } from "@/constants";
import { GrAdd } from "react-icons/gr";
import { BiSolidError } from "react-icons/bi";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ChangeEvent, useState } from "react";
import { GiPathDistance } from "react-icons/gi";
import { AiOutlineCompass } from "react-icons/ai";
import { DateInput, TimeInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export default function Journeys() {
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [fileUploadError, setFileUploadError] = useState("");

  const [gpxData, setGpxData] = useState<{
    startTime: String | null;
    endTime: String | null;
    date: Date | null;
    coordinates: number[][] | null;
  }>({
    date: null,
    endTime: null,
    startTime: null,
    coordinates: null,
  });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null || e.target.files.length === 0) {
      setFileUploadError("Please upload a valid .gpx File");
      return;
    }

    let file: File = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event: ProgressEvent<FileReader>) {
        const rawData = event.target!.result;
        if (!rawData) {
          notifications.show({
            color: "red",
            title: "Server Error",
            icon: <BiSolidError />,
            message: "Unable to parse the GPX file.",
          });
          return;
        }
        const gpx = new GPXparser();
        gpx.parse(rawData as string);
        console.log(gpx);

        const coordinates = gpx.tracks[0].points.map((val) => [val.lat, val.lon, val.ele]);
        setGpxData((val) => ({ ...val, coordinates: coordinates }));
      };
      reader.readAsText(file);
    }
  };

  const submit = async () => {
    setLoading(true);

    if (
      gpxData.date == null ||
      gpxData.endTime == null ||
      gpxData.startTime == null ||
      gpxData.coordinates == null
    ) {
      notifications.show({
        color: "red",
        title: "Server Error",
        icon: <BiSolidError />,
        message: "Please enter valid data before submitting the form.",
      });
      setLoading(false);
      return;
    }

    const token = Cookie.get("token");
    try {
      const response = await fetch(`${API_URL}/create_journey`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          endTime: gpxData.endTime,
          dateCreated: "15-09-2024",
          startTime: gpxData.startTime,
          gpxData: JSON.stringify({ coordinates: gpxData.coordinates }),
        }),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
      notifications.show({
        color: "red",
        title: "Server Error",
        icon: <BiSolidError />,
        message: "There was a problem contacting the server. Please try again later.",
      });
    }

    setLoading(false);
  };

  return (
    <main>
      <div className="flex justify-between items-center mt-5 px-3">
        <h1 className="font-black text-2xl text-primary">Journey</h1>
        <h3 className="font-bold text-xl">Every journey begins with a single step</h3>
        <Button className="bg-primary" leftSection={<GrAdd />} onClick={open}>
          Add
        </Button>
      </div>
      <div className="flex justify-center items-center gap-5 mt-10 py-10 mx-10 border-2 rounded-md border-slate-100 bg-slate-50 text-slate-400">
        <GiPathDistance size={64} />
        <h2>You haven't taken a journey yet</h2>
      </div>
      <Modal opened={opened} onClose={close} title="Upload Journey" size="lg">
        <h1 className="my-3 font-bold text-red-600">{fileUploadError}</h1>
        <div className="flex justify-between gap-5">
          <TimeInput
            withSeconds
            className="w-full"
            label="Start Time"
            placeholder="Start Time"
            onChange={(e) => setGpxData((val) => ({ ...val, startTime: e.target.value }))}
          />
          <TimeInput
            withSeconds
            label="End Time"
            className="w-full"
            placeholder="End Time"
            onChange={(e) => setGpxData((val) => ({ ...val, endTime: e.target.value }))}
          />
        </div>
        <DateInput
          className="my-5"
          label="Journey Date"
          onChange={(e) => setGpxData((val) => ({ ...val, date: e }))}
        />
        <label htmlFor="fileInput">
          Upload GPX (.gpx) File
          <div className="bg-green-600 text-white font-medium flex gap-2 w-fit items-center p-2 rounded mt-3">
            <AiOutlineCompass size={24} />
            <p className="">Upload File</p>
            <input hidden type="file" id="fileInput" onChange={handleFile} accept=".gpx" />
          </div>
        </label>
        <Button
          onClick={submit}
          loading={loading}
          className="bg-primary text-white mt-5 w-full"
        >
          Save Journey
        </Button>
      </Modal>
    </main>
  );
}
