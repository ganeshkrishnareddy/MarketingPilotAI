import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function AppointmentBookingPage() {
  return (
    <AiModuleWorkbench
      moduleKey="appointment-booking"
      title="Appointment Booking AI"
      description="Build booking scripts, confirmations, reminders, no-show recovery, and calendar-ready qualification flows."
      defaultChannel="Appointment Booking"
      quickActions={["Create booking script", "Generate confirmation message", "Write reminder sequence", "Create no-show recovery", "Build qualification questions", "Create reschedule reply"]}
    />
  );
}
