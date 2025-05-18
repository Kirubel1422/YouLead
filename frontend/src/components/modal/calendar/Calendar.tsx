import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { EventDay } from "./EventDay";
import { EventType } from "@/types/calendar.type";
import { useMyEventsQuery } from "@/api/calendar.api";
import { Button } from "@/components/ui/button";
import { Loadable } from "@/components/state";
import ReactMarkdown from "react-markdown";
import { DOTENV } from "@/constants/env";

interface CalendarModalProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
}

interface StreamData {
     text: string;
}

export function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
     const [date, setDate] = useState<Date | undefined>(new Date());
     const [aiGeneratedSuggestion, setAIGeneratedSuggestion] = useState<string>("");
     const [generating, setGenerating] = useState<boolean>(false); // For loading state while receiving sse
     const [generatingErr, setGeneratingErr] = useState<string>(""); // SSE error

     // Fetch user events
     const { data: events, isFetching: fetchingEvents } = useMyEventsQuery();

     // // Generate task prioritization
     const generatePrioritization = async () => {
          setGeneratingErr("");
          try {
               const suggestion = new EventSource(DOTENV.API_ENDPOINT + "/calendar/task-prioritization", {
                    withCredentials: true,
               });

               suggestion.onmessage = (event) => {
                    const str: StreamData = JSON.parse(event.data);
                    console.log(str);
                    setAIGeneratedSuggestion((prev) => prev + str.text);
               };

               suggestion.onerror = function (error) {
                    console.log(error);
                    setGeneratingErr("Stream connection failed");
               };

               // Cleanup function to close connection when component unmounts
               return () => {
                    suggestion.close();
               };
          } catch (error: any) {
               setGenerating(error.message);
               console.error(error);
          } finally {
               setGenerating(false);
          }
     };

     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-auto">
                    <DialogHeader>
                         <DialogTitle className="flex items-center gap-2">
                              <CalendarIcon className="h-5 w-5" />
                              <span>Calendar</span>
                         </DialogTitle>
                    </DialogHeader>

                    <div className="p-1 overflow-x-auto">
                         <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              className="rounded-md border custom-calendar"
                              classNames={{
                                   month: "space-y-4",
                                   table: "w-full border-collapse",
                                   head_row: "grid grid-cols-7",
                                   head_cell:
                                        "text-muted-foreground rounded-md font-normal text-[0.8rem] w-[110px] text-center",
                                   row: "grid grid-cols-7 mt-2",
                                   cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md w-[110px] h-24 border border-muted",
                                   day: "h-full w-full p-0 font-normal aria-selected:opacity-100",
                                   day_selected:
                                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                   day_today: "bg-accent text-accent-foreground",
                                   day_outside: "text-muted-foreground opacity-50",
                                   day_disabled: "text-muted-foreground opacity-50",
                                   day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                   day_hidden: "invisible",
                              }}
                              components={{
                                   Day: ({ date, ...props }) => {
                                        // For meetings (which don't have deadlines), use the event date
                                        // For tasks and projects, use the deadline date if available
                                        const dayEvents = Array.isArray(events)
                                             ? events.filter((event) => {
                                                    if (event.type === EventType.Meeting) {
                                                         return (
                                                              format(event.date, "yyyy-MM-dd") ===
                                                              format(date, "yyyy-MM-dd")
                                                         );
                                                    } else {
                                                         // For tasks and projects, show on deadline date if available
                                                         const dateToCheck = event.deadline;
                                                         if (dateToCheck)
                                                              return (
                                                                   format(dateToCheck, "yyyy-MM-dd") ===
                                                                   format(date, "yyyy-MM-dd")
                                                              );
                                                    }
                                               })
                                             : [];

                                        return <EventDay day={date} events={dayEvents} {...props} />;
                                   },
                              }}
                         />
                    </div>

                    {generating ? (
                         <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                    ) : (
                         <ReactMarkdown>{aiGeneratedSuggestion}</ReactMarkdown>
                    )}

                    {generatingErr && <p className="text-red-500 text-sm">{generatingErr}</p>}

                    <Button variant={"primary"} onClick={generatePrioritization}>
                         <Loadable isLoading={generating}>AI Task Prioritization </Loadable>
                    </Button>
               </DialogContent>
          </Dialog>
     );
}
