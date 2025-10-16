import { Weekday } from "@prisma/client";
const weekdayIndex = new Date().getDay(); // 0–6
const weekdayEnum = [
  'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
][weekdayIndex] as Weekday;
