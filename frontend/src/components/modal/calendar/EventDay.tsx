import type React from "react";
import { type Event, EventType } from "@/types/calendar.type";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventDayProps extends React.HTMLAttributes<HTMLDivElement> {
     day: Date;
     events: Event[];
     selected?: boolean;
     disabled?: boolean;
}

export function EventDay({ day, events, selected, disabled, ...props }: EventDayProps) {
     const dayNumber = day.getDate();

     return (
          <div
               className={cn(
                    "h-full w-full p-1 font-normal aria-selected:opacity-100 flex flex-col",
                    disabled && "text-muted-foreground opacity-50",
                    selected && "bg-primary text-primary-foreground",
               )}
               {...props}
          >
               <div className="text-right mb-1">{dayNumber}</div>

               <div className="flex flex-col gap-1 overflow-hidden flex-1">
                    {events.length === 0 ? (
                         <div className="text-xs text-muted-foreground h-full"></div>
                    ) : (
                         events.map((event) => (
                              <TooltipProvider key={event.id}>
                                   <Tooltip>
                                        <TooltipTrigger asChild>
                                             <div
                                                  className={cn(
                                                       "text-xs p-1 rounded truncate",
                                                       event.type === EventType.Task &&
                                                            "bg-blue-100 text-blue-800 border-l-2 border-blue-500",
                                                       event.type === EventType.Project &&
                                                            "bg-purple-100 text-purple-800 border-l-2 border-purple-500",
                                                       event.type === EventType.Meeting &&
                                                            "bg-green-100 text-green-800 border-l-2 border-green-500",
                                                  )}
                                             >
                                                  <div className="font-medium truncate">{event.title}</div>
                                             </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                             <div className="max-w-[300px] p-2">
                                                  <div className="font-medium">{event.title}</div>
                                                  <div className="text-xs mt-1">{event.type}</div>
                                             </div>
                                        </TooltipContent>
                                   </Tooltip>
                              </TooltipProvider>
                         ))
                    )}
               </div>
          </div>
     );
}
