import { forwardRef } from 'react'
import { useDrag } from 'react-dnd'
import { Task } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  task: Task
  onDelete?: (taskId: string) => void
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onDelete, className, ...props }, ref) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'task',
      item: { id: task.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }))

    const priorityColors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    }

    const handleDelete = () => {
      if (onDelete) {
        onDelete(task.id)
      }
    }

    return (
      <div
        ref={(node) => {
          drag(node)
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn(
          'group rounded-lg border bg-card p-3 shadow-sm',
          isDragging && 'opacity-50',
          'hover:border-primary/50 cursor-move',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-medium leading-none">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Delete task</span>
            </Button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {task.category && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              {task.category}
            </span>
          )}
          <span className={cn('rounded-full px-2 py-0.5', priorityColors[task.priority])}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="text-muted-foreground">
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    )
  }
)

TaskCard.displayName = 'TaskCard'
