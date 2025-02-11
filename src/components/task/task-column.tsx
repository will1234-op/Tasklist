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
          'flex flex-col gap-4 p-4 bg-muted/50 rounded-lg min-h-[500px]',
          isOver && 'ring-2 ring-primary'
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          {allowNewTasks && (
            <button
              className="text-sm px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsNewTaskDialogOpen(true)}
            >
              + New
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
            />
          ))}
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
