// components/ui/Calendar.tsx

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useColorModeValue } from "@chakra-ui/react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Define colors for "today" date based on color mode
  const dayTodayBg = useColorModeValue("bg-[#20242c]", "bg-white");
  const dayTodayText = useColorModeValue("text-white", "text-black");

  // Define colors for selected dates (adjusted to remove blue)
  const daySelectedBg = useColorModeValue("bg-[#20242c]", "bg-white");
  const daySelectedText = useColorModeValue("text-white", "text-black");

  // Define hover styles
  const dayHoverBg = useColorModeValue("hover:bg-gray-200", "hover:bg-gray-600");

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      selected={undefined} // Ensure no dates are selected by default
      className={cn("p-3", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell:
          "relative flex-1 text-center text-sm p-0 focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "w-full aspect-square p-0 font-normal aria-selected:opacity-100",
          dayHoverBg
        ),
        day_today: `${dayTodayBg} ${dayTodayText}`,
        day_selected: `${daySelectedBg} ${daySelectedText}`,
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
