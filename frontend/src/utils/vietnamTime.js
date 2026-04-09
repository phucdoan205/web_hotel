export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const parseVietnamDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) return null;

    if (DATE_ONLY_PATTERN.test(normalizedValue)) {
      return new Date(`${normalizedValue}T00:00:00+07:00`);
    }
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getVietnamParts = (value) => {
  const parsedDate = parseVietnamDateValue(value);
  if (!parsedDate) return null;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  return formatter.formatToParts(parsedDate).reduce((parts, part) => {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
    return parts;
  }, {});
};

export const getVietnamDateKey = (value = new Date()) => {
  const parts = getVietnamParts(value);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : "";
};

export const getVietnamMonthKey = (value = new Date()) => {
  const parts = getVietnamParts(value);
  return parts ? `${parts.year}-${parts.month}` : "";
};

export const getVietnamDateOffsetKey = (offsetDays, baseValue = new Date()) => {
  const baseDateKey = getVietnamDateKey(baseValue);
  if (!baseDateKey) return "";

  const baseDate = new Date(`${baseDateKey}T00:00:00+07:00`);
  baseDate.setUTCDate(baseDate.getUTCDate() + offsetDays);

  return getVietnamDateKey(baseDate);
};

export const formatVietnamDateTime = (
  value,
  options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
) => {
  const parsedDate = parseVietnamDateValue(value);
  if (!parsedDate) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    ...options,
  }).format(parsedDate);
};

export const formatVietnamDate = (
  value,
  options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
) => {
  const parsedDate = parseVietnamDateValue(value);
  if (!parsedDate) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    ...options,
  }).format(parsedDate);
};

export const toVietnamStartOfDayISOString = (value = new Date()) => {
  const dateKey = getVietnamDateKey(value);
  if (!dateKey) return "";

  return new Date(`${dateKey}T00:00:00+07:00`).toISOString();
};

export const formatPreservedApiDateTime = (value) => {
  if (!value) return "-";

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    const dateTimeMatch = normalizedValue.match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/,
    );

    if (dateTimeMatch && !/(Z|[+-]\d{2}:\d{2})$/i.test(normalizedValue)) {
      const [, year, month, day, hour, minute, second = "00"] = dateTimeMatch;
      return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
    }

    const dateOnlyMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return `${day}/${month}/${year}`;
    }
  }

  return formatVietnamDateTime(value);
};
