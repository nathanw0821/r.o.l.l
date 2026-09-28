import SeasonCalendar from "@/components/calendar/season-calendar";
import { CALENDAR_TITLE } from "@/lib/events/calendar";

export const metadata = {
  title: "Season calendar | R.O.L.L.",
  description: `Fallout 76 ${CALENDAR_TITLE}: every double XP, double S.C.O.R.E., bonus weekend and seasonal event with start and end in your own time zone, and an iCalendar feed to subscribe to.`,
};

export default function CalendarPage() {
  return <SeasonCalendar />;
}
