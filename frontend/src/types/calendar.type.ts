export enum EventType {
     Task = "Task",
     Project = "Project",
     Meeting = "Meeting",
}

export interface Event {
     id: string;
     title: string;
     date: Date;
     type: EventType;
     deadline?: Date; // Optional deadline for Task and Project events
}
