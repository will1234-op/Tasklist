import { forwardRef } from 'react'
import { Task } from '@/types'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  task: Task
  onDelete?: (taskId: string) => void
}

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onDelete, className, ...props }, ref) => {
    const handleDelete = () => {
      if (onDelete) {
        onDelete(task.id)
      }
    }

    const getAgeText = (createdAt: string): string => {
      const now = new Date()
      const created = new Date(createdAt)
      const diffTime = Math.abs(now.getTime() - created.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

      return diffDays > 1 ? `${diffDays}d` : `${diffHours}h`
    }

    return (
      <Card
        ref={ref}
        className={cn('w-full hover:shadow-md transition-shadow', className)}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                task.priority === 'high' && 'bg-red-500',
                task.priority === 'medium' && 'bg-yellow-500',
                task.priority === 'low' && 'bg-green-500'
              )}
            />
            <h3 className="font-semibold text-sm">{task.title}</h3>
          </div>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete task"
          >
            🗑️
          </button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {task.description}
          </p>
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
              {task.category}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between text-xs text-gray-500">
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
          <span>Age: {getAgeText(task.createdAt)}</span>
        </CardFooter>
      </Card>
    )
  }
)
TaskCard.displayName = 'TaskCard'

export { TaskCard }
