
import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Circle, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Todo {
  id: string;
  body: string;
  completed: boolean;
}

const API_BASE = "http://localhost:5000/api";

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE}/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data || []);
      } else {
        throw new Error('Failed to fetch todos');
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "Error",
        description: "Failed to load todos. Please check if your backend is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new todo
  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setCreating(true);
    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: newTodo.trim(),
          completed: false,
        }),
      });

      if (response.ok) {
        const createdTodo = await response.json();
        setTodos(prev => [createdTodo, ...prev]);
        setNewTodo("");
        toast({
          title: "Success",
          description: "Todo created successfully!",
        });
      } else {
        throw new Error('Failed to create todo');
      }
    } catch (error) {
      console.error("Error creating todo:", error);
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id: string, completed: boolean) => {
    if (completed) return; // Backend only supports marking as completed, not uncompleting

    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: "PATCH",
      });

      if (response.ok) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === id ? { ...todo, completed: true } : todo
          )
        );
        toast({
          title: "Success",
          description: "Todo marked as completed!",
        });
      } else {
        throw new Error('Failed to update todo');
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
        toast({
          title: "Success",
          description: "Todo deleted successfully!",
        });
      } else {
        throw new Error('Failed to delete todo');
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo App</h1>
          <p className="text-gray-600">Stay organized and get things done</p>
          {totalCount > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              {completedCount} of {totalCount} completed
            </div>
          )}
        </div>

        {/* Add Todo Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={createTodo} className="flex gap-3">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                disabled={creating}
              />
              <Button
                type="submit"
                disabled={!newTodo.trim() || creating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <Card className="shadow-md border-0 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Circle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No todos yet</h3>
                <p className="text-gray-500">Add your first todo above to get started!</p>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card
                key={todo.id}
                className={`shadow-md border-0 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      disabled={todo.completed}
                      className={`flex-shrink-0 transition-colors duration-200 ${
                        todo.completed
                          ? 'text-green-600 cursor-default'
                          : 'text-gray-400 hover:text-green-600 cursor-pointer'
                      }`}
                    >
                      {todo.completed ? (
                        <CircleCheck className="h-6 w-6" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </button>
                    <span
                      className={`flex-1 transition-all duration-200 ${
                        todo.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                      }`}
                    >
                      {todo.body}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <Card className="mt-8 shadow-md border-0 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-sm text-gray-500">
                  {Math.round((completedCount / totalCount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Built with React + Go Fiber + MongoDB
        </div>
      </div>
    </div>
  );
};

export default Index;
