import { useState } from 'react'
import { useDrop } from 'react-dnd'
import { Task } from '@/types'
import { TaskCard } from './task-card'
import { NewTaskDialog } from './new-task-dialog'
import { cn } from '@/lib/utils'

interface TaskColumnProps {
  title: string
  tasks: Task[]
  status: Task['status']
  allowNewTasks?: boolean
  onTaskDrop?: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask?: (taskId: string) => void
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function TaskColumn({
  title,
  tasks,
  status,
  allowNewTasks = true,
  onTaskDrop,
  onDeleteTask,
  onCreateTask,
}: TaskColumnProps) {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false)
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

  const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (onCreateTask) {
      onCreateTask(task)
    }
  }

  return (
    <>
      <div
        ref={drop}
        className={cn(
          'flex flex-col bg-muted/50 rounded-lg border border-border shadow-sm',
          isOver && 'ring-2 ring-primary'
        )}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">{title}</h2>
              <span className="text-sm text-muted-foreground">
                {tasks.length}
              </span>
            </div>
            {allowNewTasks && (
              <button
                onClick={() => setIsNewTaskDialogOpen(true)}
                className="text-sm px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                + New
              </button>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3 min-h-[calc(100vh-16rem)]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </div>

      <NewTaskDialog
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onTaskCreate={handleCreateTask}
        status={status}
      />
    </>
  )
}
