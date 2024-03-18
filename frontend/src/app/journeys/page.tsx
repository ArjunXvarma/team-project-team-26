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
        showErrorMessage("Error", journeyData.message!);
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

  return (
    <main>
      <div className="flex justify-between items-center mt-5 px-3">
        <h1 className="font-black text-2xl text-primary">Journey</h1>
        <h3 className="font-bold text-xl">Every journey begins with a single step</h3>
        <Button className="bg-primary" leftSection={<GrAdd />} onClick={open}>
          Add
        </Button>
      </div>
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

      {journeys &&
        journeys.map((journey, i) => (
          <div
            key={i}
            className="mt-10 mx-10 px-5 py-3 border-2 rounded-md border-slate-100 bg-[#E8EFEC]"
          >
            <Link href={`/journeys/${journey.id}`}>
              <h2 className="font-semibold mt-5">{journey.name}</h2>
              <h3 className="mt-3">Date: {journey.dateCreated}</h3>
              <h3 className="mt-2">Distance: {journey.totalDistance.toFixed(2)}</h3>
            </Link>
          </div>
        ))}

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
            Upload GPX (.gpx) File
            {fileUploadStatus ? (
              <p
                className={`text-xs class text-${
                  fileUploadStatus.type == "error" ? "[#FA5252]" : "primary"
                }`}
              >
                {fileUploadStatus.msg}
              </p>
            ) : null}
            <div className="mt-5 flex items-center gap-3">
              {gpxLoading && <Loader size="sm" color="green" />}
              <div className="bg-green-600 text-white font-medium flex gap-2 w-fit items-center p-2 rounded">
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
          className="bg-primary text-white mt-5 w-full"
        >
          Save Journey
        </Button>
      </Modal>
    </main>
  );
}
