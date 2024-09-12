import * as d3 from "d3";

type YearOption = "numeric" | "short" | "long" | "none";
type MonthOption = "numeric" | "short" | "long";
type DateOptions = {
  month?: MonthOption;
  year?: YearOption;
};

export function formatDate(date: Date, { month, year }: DateOptions = {}) {
  if (month === "numeric") {
    return `${formatDay(date)}/${formatMonth(date, month)}${formatYear(date, year, "/")}`;
  }
  return `${formatMonth(date, month)} ${formatDay(date)} ${formatYear(date, year, "'")}`;
}

export function formatDay(date: Date) {
  return d3.timeFormat("%-e")(date);
}

export function formatMonth(date: Date, option: MonthOption = "short") {
  if (option === "numeric") {
    return `${d3.timeFormat("%-m")(date)}`;
  }
  return `${d3.timeFormat("%b")(date)}`;
}

export function formatYear(
  date: Date,
  option: YearOption = "short",
  prefix: string = "",
) {
  if (option === "none") {
    return "";
  }
  return `${prefix}${date.getFullYear() % 100}`;
}

export function formatResponsiveDate(date: Date, width: number) {
  if (width < 512) {
    return formatDate(date, { month: "numeric", year: "none" });
  }
  if (width < 1024) {
    return formatDate(date, { month: "numeric" });
  }
  return formatDate(date);
}
