import { useState, useEffect, useCallback } from "react";
import { Plus, Moon, Sun, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableTodoItem } from "@/components/DraggableTodoItem";

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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            document.querySelector('input[placeholder*="What needs"]')?.focus();
            break;
          case 'd':
            e.preventDefault();
            toggleTheme();
            break;
          case '/':
            e.preventDefault();
            setShowShortcuts(prev => !prev);
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

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

  const editTodo = async (id: string, newBody: string) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: newBody }),
      });

      if (response.ok) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === id ? { ...todo, body: newBody } : todo
          )
        );
        toast({
          title: "Success",
          description: "Todo updated successfully!",
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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, []);

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-500 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with theme toggle */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/50 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm border-white/30 dark:border-gray-600/50 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
          
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4 animate-fade-in">
            Todo App
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">Stay organized and get things done with style</p>
          
          {totalCount > 0 && (
            <div className="inline-flex items-center gap-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 dark:border-gray-600/20">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completedCount} of {totalCount} completed
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts overlay */}
        {showShortcuts && (
          <Card className="mb-8 shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md animate-fade-in">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">New todo</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+N</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Toggle theme</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+D</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Show shortcuts</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl+/</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Close overlay</span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Esc</code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Todo Form */}
        <Card className="mb-12 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md animate-fade-in">
          <CardContent className="p-8">
            <form onSubmit={createTodo} className="flex gap-4">
              <Input
                type="text"
                placeholder="What needs to be done? (Ctrl+N to focus)"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="flex-1 h-12 text-lg border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                disabled={creating}
              />
              <Button
                type="submit"
                disabled={!newTodo.trim() || creating}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todo List */}
        <div className="space-y-4">
          {todos.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md animate-fade-in">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-6">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Plus className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-3">No todos yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Add your first todo above to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={todos} strategy={verticalListSortingStrategy}>
                {todos.map((todo) => (
                  <DraggableTodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">Built with React + Go Fiber + MongoDB</p>
          <p className="text-xs">✨ Enhanced with drag & drop, editing, keyboard shortcuts, and dark mode</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
