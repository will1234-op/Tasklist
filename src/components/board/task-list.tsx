import { useState } from 'react'
import { useDrop } from 'react-dnd'
import { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TaskListProps {
  title: string
  tasks: Task[]
  status: TaskStatus
  allowNewTasks?: boolean
  onTaskDrop?: (taskId: string, newStatus: TaskStatus) => void
  onDeleteTask?: (taskId: string) => void
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function TaskList({
  title,
  tasks,
  status,
  allowNewTasks = true,
  onTaskDrop,
  onDeleteTask,
  onCreateTask,
}: TaskListProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: status,
    priority: 'medium' as const,
    category: '',
    dueDate: '',
    completed: false,
  })

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: string }) => {
      if (onTaskDrop) {
        onTaskDrop(item.id, status)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (onCreateTask) {
      onCreateTask(newTask)
      setShowNewTaskForm(false)
      setNewTask({
        title: '',
        description: '',
        status: status,
        priority: 'medium',
        category: '',
        dueDate: '',
        completed: false,
      })
    }
  }

  return (
    <div
      ref={drop}
      className={cn(
        'flex w-80 shrink-0 flex-col rounded-lg bg-muted/50 p-2',
        isOver && 'ring-2 ring-primary'
      )}
    >
      <div className="flex items-center justify-between p-2">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex-1 space-y-2 p-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
        ))}
        {showNewTaskForm ? (
          <form onSubmit={handleCreateTask} className="space-y-2">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
            <Textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <Input
              placeholder="Category"
              value={newTask.category}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  priority: e.target.value as Task['priority'],
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Input
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNewTaskForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Task</Button>
            </div>
          </form>
        ) : (
          allowNewTasks && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowNewTaskForm(true)}
            >
              + Add Task
            </Button>
          )
        )}
      </div>
    </div>
  )
}
