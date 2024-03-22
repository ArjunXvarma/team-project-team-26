import { BiSolidError } from "react-icons/bi";
import { notifications } from "@mantine/notifications";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export const showErrorMessage = (title: String, message: String) => {
  notifications.show({
    color: "red",
    title: title,
    message: message,
    icon: <BiSolidError />,
  });
};

export const showSuccessMessage = (title: String, message: String) => {
  notifications.show({
    title: title,
    color: "green",
    message: message,
    icon: <IoMdCheckmarkCircleOutline />,
  });
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isValidTime = (hour: number, minute: number) => {
  return (
    !isNaN(hour) && !isNaN(minute) && hour >= 0 && hour < 24 && minute >= 0 && minute < 60
  );
};
