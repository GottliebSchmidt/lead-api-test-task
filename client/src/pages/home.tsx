import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, RotateCcw, Trash2, Send } from "lucide-react";
import { useState } from "react";
import { api, buildUrl } from "@shared/routes";
import type { CounterResponse, GreetingsListResponse } from "@shared/routes";

export default function Home() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const { data: counter, isLoading: counterLoading } = useQuery<CounterResponse>({
    queryKey: [api.counter.get.path],
  });

  const { data: greetings = [], isLoading: greetingsLoading } = useQuery<GreetingsListResponse>({
    queryKey: [api.greetings.list.path],
  });

  const incrementMutation = useMutation({
    mutationFn: () => apiRequest(api.counter.increment.method, api.counter.increment.path),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.counter.get.path] }),
  });

  const decrementMutation = useMutation({
    mutationFn: () => apiRequest(api.counter.decrement.method, api.counter.decrement.path),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.counter.get.path] }),
  });

  const resetMutation = useMutation({
    mutationFn: () => apiRequest(api.counter.reset.method, api.counter.reset.path),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.counter.get.path] }),
  });

  const createGreetingMutation = useMutation({
    mutationFn: (data: { name: string; message: string }) =>
      apiRequest(api.greetings.create.method, api.greetings.create.path, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.greetings.list.path] });
      setName("");
      setMessage("");
      toast({ title: "Greeting created!" });
    },
    onError: () => {
      toast({ title: "Failed to create greeting", variant: "destructive" });
    },
  });

  const deleteGreetingMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(api.greetings.delete.method, buildUrl(api.greetings.delete.path, { id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.greetings.list.path] });
      toast({ title: "Greeting deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && message.trim()) {
      createGreetingMutation.mutate({ name: name.trim(), message: message.trim() });
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold" data-testid="text-title">Demo App</h1>
          <p className="text-muted-foreground" data-testid="text-subtitle">
            A simple full-stack demo with a counter and greetings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Counter</CardTitle>
              <CardDescription>Click the buttons to change the value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-6xl font-bold" data-testid="text-counter-value">
                  {counterLoading ? "..." : counter?.value ?? 0}
                </span>
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => decrementMutation.mutate()}
                  disabled={decrementMutation.isPending}
                  data-testid="button-decrement"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isPending}
                  data-testid="button-reset"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => incrementMutation.mutate()}
                  disabled={incrementMutation.isPending}
                  data-testid="button-increment"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Greeting</CardTitle>
              <CardDescription>Create a new greeting message</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                />
                <Textarea
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  data-testid="input-message"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createGreetingMutation.isPending || !name.trim() || !message.trim()}
                  data-testid="button-submit-greeting"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Greeting
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Greetings</CardTitle>
            <CardDescription>Messages from the community</CardDescription>
          </CardHeader>
          <CardContent>
            {greetingsLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : greetings.length === 0 ? (
              <p className="text-center text-muted-foreground" data-testid="text-no-greetings">
                No greetings yet. Be the first to add one!
              </p>
            ) : (
              <div className="space-y-3">
                {greetings.map((greeting) => (
                  <div
                    key={greeting.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-md bg-muted/50"
                    data-testid={`card-greeting-${greeting.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" data-testid={`text-greeting-name-${greeting.id}`}>
                        {greeting.name}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-greeting-message-${greeting.id}`}>
                        {greeting.message}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteGreetingMutation.mutate(greeting.id)}
                      disabled={deleteGreetingMutation.isPending}
                      data-testid={`button-delete-greeting-${greeting.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
