"use client";

import * as Toast from "@radix-ui/react-toast";
import { useCallback, useEffect, useState } from "react";
import { TodoItem } from "@/components/TodoItem";
import { TodoForm } from "@/components/TodoForm";
import { Todo } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { useDebounceValue } from "usehooks-ts";

export default function Dashboard() {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", variant: "default" });

  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setToastMessage({ title, description, variant });
    setToastOpen(true);
  };

  const fetchTodos = useCallback(
    async (page: number) => {
      try {
        const response = await fetch(
          `/api/todos?page=${page}&search=${debouncedSearchTerm}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch todos");
        }
        const data = await response.json();
        setTodos(data.todos);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setIsLoading(false);
        showToast("Success", "Todos fetched successfully.");
      } catch (error) {
        setIsLoading(false);
        showToast("Error", "Failed to fetch todos. Please try again.", "destructive");
      }
    },
    [debouncedSearchTerm]
  );

  useEffect(() => {
    fetchTodos(1);
    fetchSubscriptionStatus();
  }, [fetchTodos]);

  const fetchSubscriptionStatus = async () => {
    const response = await fetch("/api/subscription");
    if (response.ok) {
      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
    }
  };

  const handleAddTodo = async (title: string) => {
    showToast("Adding Todo", "Please wait...");
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error("Failed to add todo");
      }
      await fetchTodos(currentPage);
      showToast("Success", "Todo added successfully.");
    } catch (error) {
      showToast("Error", "Failed to add todo. Please try again.", "destructive");
    }
  };

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    showToast("Updating Todo", "Please wait...");
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) {
        throw new Error("Failed to update todo");
      }
      await fetchTodos(currentPage);
      showToast("Success", "Todo updated successfully.");
    } catch (error) {
      showToast("Error", "Failed to update todo. Please try again.", "destructive");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    showToast("Deleting Todo", "Please wait...");
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }
      await fetchTodos(currentPage);
      showToast("Success", "Todo deleted successfully.");
    } catch (error) {
      showToast("Error", "Failed to delete todo. Please try again.", "destructive");
    }
  };

  return (
    <Toast.Provider>
      <div className="container mx-auto p-4 max-w-3xl mb-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Welcome, {user?.emailAddresses[0].emailAddress}!
        </h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Todo</CardTitle>
          </CardHeader>
          <CardContent>
            <TodoForm onSubmit={(title: string) => handleAddTodo(title)} />
          </CardContent>
        </Card>
        {!isSubscribed && todos.length >= 3 && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You&apos;ve reached the maximum number of free todos.{" "}
              <Link href="/subscribe" className="font-medium underline">
                Subscribe now
              </Link>{" "}
              to add more.
            </AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Your Todos</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            {isLoading ? (
              <p className="text-center text-muted-foreground">
                Loading your todos...
              </p>
            ) : todos.length === 0 ? (
              <p className="text-center text-muted-foreground">
                You don&apos;t have any todos yet. Add one above!
              </p>
            ) : (
              <>
                <ul className="space-y-4">
                  {todos.map((todo: Todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </ul>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page: number) => fetchTodos(page)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Toast.Root
        className={`fixed bottom-4 right-4 w-96 rounded-md bg-white p-4 shadow-lg ${
          toastMessage.variant === "destructive" ? "border-red-500" : "border-green-500"
        }`}
        open={toastOpen}
        onOpenChange={setToastOpen}
      >
        <Toast.Title className="font-bold">{toastMessage.title}</Toast.Title>
        <Toast.Description>{toastMessage.description}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}
