import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { EventDay } from "./EventDay";
import { type Event, EventType } from "@/types/calendar.type";
import { useLazyTaskPrioritizationSuggestionQuery, useMyEventsQuery } from "@/api/calendar.api";
import { Button } from "@/components/ui/button";
import { aiResponseToHTML } from "@/utils/basic";
import { Loadable } from "@/components/state";
import ReactMarkdown from "react-markdown";

interface CalendarModalProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
}

export function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
     const [date, setDate] = useState<Date | undefined>(new Date());
     const [aiGeneratedSuggestion, setAIGeneratedSuggestion] = useState<string>("");

     // Fetch user events
     const { data: events, isFetching: fetchingEvents } = useMyEventsQuery();

     // Generate task prioritization
     const [generateSuggestion, { isLoading: loadingSuggestion }] = useLazyTaskPrioritizationSuggestionQuery();
     const generatePrioritization = async () => {
          try {
               const suggestion = await generateSuggestion().unwrap();
               const HTMLFormat = aiResponseToHTML(suggestion);
               setAIGeneratedSuggestion(HTMLFormat);
          } catch (error: any) {
               console.error(error);
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

                    {aiGeneratedSuggestion ? (
                         loadingSuggestion ? (
                              <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                         ) : (
                              <ReactMarkdown
                                   components={{
                                        h1: ({ node, ...props }) => (
                                             <h1 className="text-3xl font-bold my-4" {...props} />
                                        ),
                                        h2: ({ node, ...props }) => (
                                             <h2 className="text-2xl font-semibold my-3" {...props} />
                                        ),
                                        h3: ({ node, ...props }) => (
                                             <h3 className="text-xl font-medium my-2" {...props} />
                                        ),
                                        p: ({ node, ...props }) => (
                                             <p className="text-base leading-6 my-2" {...props} />
                                        ),
                                        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                                        ul: ({ node, ...props }) => (
                                             <ul className="list-disc list-inside my-2" {...props} />
                                        ),
                                        ol: ({ node, ...props }) => (
                                             <ol className="list-decimal list-inside my-2" {...props} />
                                        ),
                                        li: ({ node, ...props }) => <li className="ml-4 my-1" {...props} />,
                                        table: ({ node, ...props }) => (
                                             <table
                                                  className="ai-table border-collapse border w-full my-4"
                                                  {...props}
                                             />
                                        ),
                                        thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
                                        tbody: ({ node, ...props }) => <tbody {...props} />,
                                        tr: ({ node, ...props }) => <tr className="border-b" {...props} />,
                                        th: ({ node, ...props }) => (
                                             <th className="text-left px-4 py-2 font-semibold border" {...props} />
                                        ),
                                        td: ({ node, ...props }) => <td className="px-4 py-2 border" {...props} />,
                                        a: ({ node, ...props }) => (
                                             <a
                                                  className="text-blue-600 hover:underline"
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  {...props}
                                             />
                                        ),
                                        br: () => <br />,
                                   }}
                              >
                                   {aiGeneratedSuggestion}
                              </ReactMarkdown>
                         )
                    ) : (
                         ""
                    )}

                    <Button onClick={generatePrioritization}>
                         <Loadable isLoading={loadingSuggestion}>AI Task Prioritization </Loadable>
                    </Button>
               </DialogContent>
          </Dialog>
     );
}
