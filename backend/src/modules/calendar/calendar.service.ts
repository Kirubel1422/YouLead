import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "src/configs/firebase";
import { ENV } from "src/constants/dotenv";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { EventType, type Event } from "src/interfaces/calendar.interface";
import { IMeeting } from "src/interfaces/meeting.interface";
import { type IProject } from "src/interfaces/project.interface";
import { type ITask } from "src/interfaces/task.interface";
import logger from "src/utils/logger/logger";

export class CalendarService {
  private genAi: GoogleGenerativeAI;

  constructor() {
    this.fetchUserEvents = this.fetchUserEvents.bind(this);
    this.createTaskPrioritizationPrompt =
      this.createTaskPrioritizationPrompt.bind(this);
    this.prioritizeTasks = this.prioritizeTasks.bind(this);

    this.genAi = new GoogleGenerativeAI(ENV.GENAI_API_KEY as string);
  }

  async fetchUserEvents(userId: string): Promise<Event[]> {
    logger.info(`User: ${userId} started fetching user events for calendar.`);
    // Fetch Projects
    const projectsSnap = await db
      .collection(COLLECTIONS.PROJECTS)
      .where("members", "array-contains", userId)
      .get();

    const projectsData = projectsSnap.docs.map((doc) => {
      const { name, updatedAt, deadline } = doc.data() as IProject;

      return {
        id: doc.id,
        type: EventType.Project,
        title: name,
        date: new Date(updatedAt),
        deadline: Array.isArray(deadline) ? new Date(deadline[0]) : null,
      } as Event;
    });

    // Fetch Tasks
    const tasksSnap = await db
      .collection(COLLECTIONS.TASKS)
      .where("assignedTo", "array-contains", userId)
      .get();

    const tasksData = tasksSnap.docs.map((doc) => {
      const { name, updatedAt, deadline } = doc.data() as ITask;

      return {
        id: doc.id,
        type: EventType.Task,
        title: name,
        date: new Date(updatedAt),
        deadline: Array.isArray(deadline) ? new Date(deadline[0]) : null,
      } as Event;
    });

    // Fetch Meetings
    const meetingsSnap = await db
      .collection(COLLECTIONS.MEETINGS)
      .where("attendees", "array-contains", userId)
      .get();

    const meetingsData = meetingsSnap.docs.map((doc) => {
      const { agenda, startTime } = doc.data() as IMeeting;

      return {
        id: doc.id,
        type: EventType.Meeting,
        title: agenda,
        date: new Date(startTime),
      } as Event;
    });

    logger.info(`Fetching completed.`);
    return meetingsData.concat(tasksData).concat(projectsData).filter(Boolean);
  }

  createTaskPrioritizationPrompt(tasks: any[]) {
    return `
    You are an expert productivity assistant. Analyze these tasks and provide:
    1. A pure markdown which has the following columns sorted in urgency (the urgency is based on your analysis): 
    - Name of the task
    - Progress Level
    - Priority Level
    - Deadline (if not specified you can respond with N/A)
    - Time Estimate
    2. A very simple paragraph of maximum 50 words that explain how you analyzed and ordered them.
  
    Task Format:
    - Name: [taskName]
    - Progress: [progress]%
    - Priority: [priority]
    - Deadline: [deadline or "No deadline"]
  
    Current Date: ${new Date().toISOString().split("T")[0]}
  
    Rules:
    - High priority + nearing deadline = urgent
    - Medium progress tasks may need follow-up
    - No deadline tasks should be scheduled based on priority
  
    Tasks:
    ${tasks
      .map(
        (task) => `
    - Name: ${task.taskName}
      Progress: ${task.progress}%
      Priority: ${task.priority}
      Deadline: ${
        task.deadline ? task.deadline.toISOString().split("T")[0] : "None"
      }
    `
      )
      .join("")}
    `;
  }

  async prioritizeTasks(userId: string): Promise<any> {
    // Parameters for AI
    // priority, deadline, name, progress
    // Fetch Tasks
    const tasksSnap = await db
      .collection(COLLECTIONS.TASKS)
      .where("assignedTo", "array-contains", userId)
      .where("status", "==", "pending")
      .get();

    // Prepare array of tasks to feed to generate prompt from
    const tasksData = tasksSnap.docs.map((doc) => {
      const { name, deadline, priority, progress } = doc.data() as ITask;

      return {
        id: doc.id,
        type: EventType.Task,
        taskName: name,
        progress,
        priority,
        deadline: Array.isArray(deadline) ? new Date(deadline[0]) : null,
      };
    });

    // Create model
    const model = this.genAi.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.3,
        topP: 0.2,
      },
    });

    const prompt = this.createTaskPrioritizationPrompt(tasksData);

    // Generate content
    const results = await model.generateContentStream(prompt);
    return results.stream;
  }
}
