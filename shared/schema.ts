import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const counters = pgTable("counters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("default"),
  value: integer("value").notNull().default(0),
});

export const greetings = pgTable("greetings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
});

// === SCHEMAS ===
export const insertCounterSchema = createInsertSchema(counters).omit({ id: true });
export const insertGreetingSchema = createInsertSchema(greetings).omit({ id: true });

// === TYPES ===
export type Counter = typeof counters.$inferSelect;
export type InsertCounter = z.infer<typeof insertCounterSchema>;

export type Greeting = typeof greetings.$inferSelect;
export type InsertGreeting = z.infer<typeof insertGreetingSchema>;

// === API TYPES ===
export type CounterResponse = Counter;
export type GreetingResponse = Greeting;
export type GreetingsListResponse = Greeting[];
