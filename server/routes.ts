import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const greetings = await storage.getGreetings();
  if (greetings.length === 0) {
    await storage.createGreeting({ name: "World", message: "Hello, World! Welcome to the demo app." });
    await storage.createGreeting({ name: "Python", message: "Python is a great programming language!" });
    await storage.createGreeting({ name: "Developer", message: "Keep coding and building awesome things!" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await seedDatabase();

  app.get(api.counter.get.path, async (_req, res) => {
    const counter = await storage.getCounter();
    res.json(counter);
  });

  app.post(api.counter.increment.path, async (_req, res) => {
    const counter = await storage.incrementCounter();
    res.json(counter);
  });

  app.post(api.counter.decrement.path, async (_req, res) => {
    const counter = await storage.decrementCounter();
    res.json(counter);
  });

  app.post(api.counter.reset.path, async (_req, res) => {
    const counter = await storage.resetCounter();
    res.json(counter);
  });

  app.get(api.greetings.list.path, async (_req, res) => {
    const greetings = await storage.getGreetings();
    res.json(greetings);
  });

  app.post(api.greetings.create.path, async (req, res) => {
    try {
      const input = api.greetings.create.input.parse(req.body);
      const greeting = await storage.createGreeting(input);
      res.status(201).json(greeting);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.greetings.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await storage.deleteGreeting(id);
    if (!deleted) {
      return res.status(404).json({ message: "Greeting not found" });
    }
    res.status(204).send();
  });

  return httpServer;
}
