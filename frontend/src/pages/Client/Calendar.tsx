import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/sidebar/layout";
import { Badge } from "@/components/ui/badge";
import { EventType } from "@/types/calendar.type";
import { useMyEventsQuery } from "@/api/calendar.api";
import { EventDay } from "@/components/modal/calendar/EventDay";

export default function Calendar() {
     const [date, setDate] = useState<Date | undefined>(new Date());

     // Fetch user events
     const { data: events } = useMyEventsQuery();

     const selectedDateEvents = events?.filter((event) => {
          if (date) {
               if (event.type === EventType.Meeting) {
                    return format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
               } else {
                    const dateToCheck = event.deadline;
                    if (dateToCheck) {
                         return format(dateToCheck, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                    }
               }
          }
          return false;
     });

     return (
          <Layout>
               <main className="flex-1 p-8 pt-6">
                    <div className="flex items-center justify-between mb-6">
                         <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                         <Card>
                              <CardContent className="p-4">
                                   <CalendarComponent
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md border custom-calendar w-fit"
                                        classNames={{
                                             month: "space-y-4",
                                             table: "w-full border-collapse",
                                             head_row: "grid grid-cols-7",
                                             head_cell:
                                                  "text-muted-foreground rounded-md font-normal text-[0.8rem] w-[110px] text-center",
                                             row: "grid grid-cols-7 mt-2",
                                             cell: "relative  p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md w-[110px] h-24 border border-muted",
                                             day: "h-full w-full p-0 font-normal aria-selected:opacity-100",
                                             day_selected:
                                                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                             day_today: "bg-accent text-accent-foreground",
                                             day_outside: "text-muted-foreground opacity-50",
                                             day_disabled: "text-muted-foreground opacity-50",
                                             day_range_middle:
                                                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                             day_hidden: "invisible",
                                        }}
                                        components={{
                                             Day: ({ date, ...props }) => {
                                                  const dayEvents = Array.isArray(events)
                                                       ? events.filter((event) => {
                                                              if (event.type === EventType.Meeting) {
                                                                   return (
                                                                        format(event.date, "yyyy-MM-dd") ===
                                                                        format(date, "yyyy-MM-dd")
                                                                   );
                                                              } else {
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
                              </CardContent>
                         </Card>

                         <div className="space-y-6">
                              <Card>
                                   <CardHeader>
                                        <CardTitle className="text-lg">
                                             {date ? format(date, "MMMM d, yyyy") : "No date selected"}
                                        </CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        {selectedDateEvents && selectedDateEvents.length > 0 ? (
                                             <div className="space-y-4">
                                                  {selectedDateEvents.map((event) => (
                                                       <div
                                                            key={event.id}
                                                            className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/20"
                                                       >
                                                            <div className="flex-1">
                                                                 <h4 className="font-medium">{event.title}</h4>
                                                                 <Badge
                                                                      variant="secondary"
                                                                      className={
                                                                           event.type === EventType.Meeting
                                                                                ? "bg-green-100 text-green-800"
                                                                                : event.type === EventType.Task
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : "bg-purple-100 text-purple-800"
                                                                      }
                                                                 >
                                                                      {event.type}
                                                                 </Badge>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <p className="text-sm text-gray-500">No events for this date</p>
                                        )}
                                   </CardContent>
                              </Card>

                              <Card>
                                   <CardHeader>
                                        <CardTitle className="text-lg">Events</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        {events && events.length > 0 ? (
                                             <div className="space-y-4">
                                                  {events.slice(0, 5).map((event) => (
                                                       <div
                                                            key={event.id}
                                                            className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/20"
                                                       >
                                                            <div className="flex-1">
                                                                 <h4 className="font-medium">{event.title}</h4>
                                                                 <p className="text-sm text-gray-500">
                                                                      {format(
                                                                           event.type === EventType.Meeting
                                                                                ? event.date
                                                                                : event.deadline || event.date,
                                                                           "MMM d, yyyy",
                                                                      )}
                                                                 </p>
                                                            </div>
                                                            <Badge
                                                                 variant="secondary"
                                                                 className={
                                                                      event.type === EventType.Meeting
                                                                           ? "bg-green-100 text-green-800"
                                                                           : event.type === EventType.Task
                                                                           ? "bg-blue-100 text-blue-800"
                                                                           : "bg-purple-100 text-purple-800"
                                                                 }
                                                            >
                                                                 {event.type}
                                                            </Badge>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <p className="text-sm text-gray-500">No upcoming events</p>
                                        )}
                                   </CardContent>
                              </Card>
                         </div>
                    </div>
               </main>
          </Layout>
     );
}
