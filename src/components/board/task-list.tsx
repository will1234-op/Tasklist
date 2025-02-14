import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TaskDialog } from '@/components/task-dialog'
import { cn } from '@/lib/utils'

interface TaskListProps {
  title: string
  tasks: Task[]
  status: TaskStatus
  columnName: string
  onDeleteTask?: (taskId: string) => void
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activityLog' | 'position'>) => void
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void
  onAddComment?: (taskId: string, content: string) => void
}

export function TaskList({
  title,
  tasks,
  status,
  columnName,
  onDeleteTask,
  onCreateTask,
  onUpdateTask,
  onAddComment,
}: TaskListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Sort tasks by position
  const sortedTasks = [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0))

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 rounded-lg transition-colors',
              snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-transparent'
            )}
          >
            <div className="space-y-4 p-1">
              {sortedTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  index={index}
                  task={task}
                  columnName={columnName}
                  onDelete={onDeleteTask}
                  onUpdate={onUpdateTask}
                  onAddComment={onAddComment}
                />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
      <TaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={(task) => {
          if (onCreateTask) {
            onCreateTask({ ...task, status })
          }
        }}
      />
    </div>
  )
}
