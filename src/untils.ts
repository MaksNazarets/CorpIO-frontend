import axios from "axios";

// export const BASE_URL = "http://localhost:5000";
// export const BASE_URL = "https://knjgg5wc-5000.euw.devtunnels.ms";
export const BASE_URL = "https://helical-fin-424413-q2.lm.r.appspot.com"; // production
export const BASE_API_URL = BASE_URL + "/api";
export const MESSAGES_TO_LOAD_NUMBER = 30;
// export const baseUrl = "https://xh5wtqf8-5000.euw.devtunnels.ms/api";

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

export const getFilenameParts = (filename: string) => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return { name: filename, extension: "" };
  }
  return {
    name: filename.substring(0, lastDotIndex),
    extension: filename.substring(lastDotIndex + 1),
  };
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${size} ${sizes[i]}`;
};

export const getLastOnlineDateTime = (timestamp: string | null | undefined) => {
  if (!timestamp) return "ніколи";

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Kiev",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  const dateObj = new Date(timestamp);

  let lastTimeOnline = dateObj
    ? dateObj.toLocaleString("uk-UA", dateOptions)
    : null;

  function getDateDiffInHours(date1: Date, date2: Date) {
    const millisecondsDiff = Math.abs(date1.getTime() - date2.getTime());
    const hoursDiff = millisecondsDiff / (1000 * 60 * 60); // 1 h = 1000 ms * 60 s * 60 m
    return hoursDiff;
  }

  if (dateObj) {
    const lastTimeOnlineInHours = getDateDiffInHours(new Date(), dateObj);

    if (lastTimeOnlineInHours < 24) {
      if (lastTimeOnlineInHours > 1) {
        lastTimeOnline = lastTimeOnlineInHours.toFixed() + " год. тому";
      } else {
        const minutes = (60 * lastTimeOnlineInHours).toFixed();
        lastTimeOnline = minutes === "0" ? "щойно" : minutes + " хв. тому";
      }
    }
  }

  return lastTimeOnline;
};

export const formatInternationalPhoneNumber = (phoneNumberString: string) => {
  let cleaned = phoneNumberString.replace(/[^\d+]/g, "");

  let match = cleaned.match(/^\+(\d{2})(\d{3})(\d{2})(\d{2})(\d{3})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }

  return phoneNumberString;
};
