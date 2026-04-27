// IST offset from UTC in milliseconds (5 hours 30 minutes)
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// Parse datetime string as IST and return UTC Date object
// If no timezone suffix, treats value as IST
export const parseAsIST = (datetimeStr) => {
  if (!datetimeStr) {
    throw new Error("Datetime string is required");
  }

  const str = String(datetimeStr).trim();

  // If string has timezone info (Z, +HH:MM, -HH:MM), parse directly
  const hasTimezone = /[Zz]$/.test(str) || /[+-]\d{2}:\d{2}$/.test(str);

  if (hasTimezone) {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid datetime value: "${str}"`);
    }
    return date;
  }

  // No timezone suffix - treat as IST by subtracting IST offset
  const naiveDate = new Date(str);
  if (isNaN(naiveDate.getTime())) {
    throw new Error(`Invalid datetime value: "${str}"`);
  }

  return new Date(naiveDate.getTime() - IST_OFFSET_MS);
};

// Format UTC Date as IST string for API responses
export const formatAsIST = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  return (
    date
      .toLocaleString("sv-SE", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      })
      .replace(" ", "T") + "+05:30"
  );
};
