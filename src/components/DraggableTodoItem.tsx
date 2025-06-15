
import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Circle, CircleCheck, Edit3, Check, X, GripVertical } from "lucide-react";

interface Todo {
  id: string;
  body: string;
  completed: boolean;
}

interface DraggableTodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newBody: string) => void;
}

export const DraggableTodoItem: React.FC<DraggableTodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.body);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (todo.completed) return;
    setIsEditing(true);
    setEditValue(todo.body);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== todo.body) {
      onEdit(todo.id, editValue.trim());
    }
    setIsEditing(false);
    setEditValue(todo.body);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(todo.body);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 ${
        todo.completed ? 'opacity-75' : ''
      } ${isDragging ? 'rotate-3 scale-105 shadow-2xl z-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          <button
            onClick={() => onToggle(todo.id, todo.completed)}
            disabled={todo.completed}
            className={`flex-shrink-0 transition-all duration-300 transform hover:scale-110 ${
              todo.completed
                ? 'text-green-600 dark:text-green-400 cursor-default'
                : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer'
            }`}
          >
            {todo.completed ? (
              <CircleCheck className="h-6 w-6" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </button>

          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-blue-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
              />
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span
              onClick={handleEdit}
              className={`flex-1 transition-all duration-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${
                todo.completed
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {todo.body}
            </span>
          )}

          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={todo.completed}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
