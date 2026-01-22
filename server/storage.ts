import { db } from "./db";
import { counters, greetings, type Counter, type Greeting, type InsertGreeting } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCounter(): Promise<Counter>;
  incrementCounter(): Promise<Counter>;
  decrementCounter(): Promise<Counter>;
  resetCounter(): Promise<Counter>;
  getGreetings(): Promise<Greeting[]>;
  createGreeting(greeting: InsertGreeting): Promise<Greeting>;
  deleteGreeting(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getCounter(): Promise<Counter> {
    const [counter] = await db.select().from(counters).limit(1);
    if (!counter) {
      const [newCounter] = await db.insert(counters).values({ name: "default", value: 0 }).returning();
      return newCounter;
    }
    return counter;
  }

  async incrementCounter(): Promise<Counter> {
    const current = await this.getCounter();
    const [updated] = await db
      .update(counters)
      .set({ value: current.value + 1 })
      .where(eq(counters.id, current.id))
      .returning();
    return updated;
  }

  async decrementCounter(): Promise<Counter> {
    const current = await this.getCounter();
    const [updated] = await db
      .update(counters)
      .set({ value: current.value - 1 })
      .where(eq(counters.id, current.id))
      .returning();
    return updated;
  }

  async resetCounter(): Promise<Counter> {
    const current = await this.getCounter();
    const [updated] = await db
      .update(counters)
      .set({ value: 0 })
      .where(eq(counters.id, current.id))
      .returning();
    return updated;
  }

  async getGreetings(): Promise<Greeting[]> {
    return await db.select().from(greetings);
  }

  async createGreeting(greeting: InsertGreeting): Promise<Greeting> {
    const [newGreeting] = await db.insert(greetings).values(greeting).returning();
    return newGreeting;
  }

  async deleteGreeting(id: number): Promise<boolean> {
    const result = await db.delete(greetings).where(eq(greetings.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
