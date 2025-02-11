import { useState } from 'react'
import { useDrop } from 'react-dnd'
import { Task } from '@/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TaskListProps {
  title: string
  tasks: Task[]
  status: Task['status']
  allowNewTasks?: boolean
  onTaskDrop?: (taskId: string, newStatus: Task['status']) => void
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
    category: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
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
      onCreateTask({
        ...newTask,
        status,
      })
    }
    setNewTask({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      dueDate: '',
    })
    setShowNewTaskForm(false)
  }

  return (
    <div
      ref={drop}
      className={cn(
        'w-80 shrink-0 select-none rounded-lg border bg-card',
        isOver && 'ring-2 ring-primary'
      )}
    >
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">{title}</h2>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-2 text-xs text-muted-foreground">
              {tasks.length}
            </span>
          </div>
          {allowNewTasks && !showNewTaskForm && (
            <Button
              onClick={() => setShowNewTaskForm(true)}
              variant="ghost"
              size="sm"
              className="h-7 px-2"
            >
              Add
            </Button>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-10rem)] overflow-y-auto p-2">
        <div className="space-y-2">
          {showNewTaskForm && (
            <form onSubmit={handleCreateTask} className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="space-y-2">
                <Input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="h-8 text-sm"
                  required
                />
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description"
                  className="h-20 resize-none text-sm"
                />
                <Input
                  type="text"
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  placeholder="Category"
                  className="h-8 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })
                    }
                    className="h-8 w-full rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setShowNewTaskForm(false)}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="h-7 px-3">
                  Add task
                </Button>
              </div>
            </form>
          )}

          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}

          {tasks.length === 0 && !showNewTaskForm && (
            <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
