import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Trash2, Pencil, Check } from 'lucide-react'
import { format } from 'date-fns'
import { TaskDetailsDialog } from '@/components/task-details-dialog'
import { TaskDialog } from '@/components/task-dialog'
import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface TaskCardProps {
  task: Task
  index: number
  onDelete?: (taskId: string) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onAddComment?: (taskId: string, content: string) => void
}

export function TaskCard({ task, index, onDelete, onUpdate, onAddComment }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              'group relative rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md',
              snapshot.isDragging && 'shadow-lg ring-2 ring-primary',
              'cursor-grab active:cursor-grabbing'
            )}
            onClick={() => setShowDetails(true)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {task.status === 'done' && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]">
                        <Check className="h-4 w-4 text-white stroke-[3]" />
                      </div>
                    )}
                    <h3 className={cn(
                      "font-medium leading-none",
                      task.priority && "text-red-500"
                    )}>{task.title}</h3>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {onUpdate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowEdit(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.priority && (
                  <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300">
                    Priority
                  </Badge>
                )}
                {task.dueDate && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.dueDate), 'MMM d')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {showDetails && (
            <TaskDetailsDialog
              task={task}
              open={showDetails}
              onOpenChange={setShowDetails}
              onUpdate={onUpdate}
              onAddComment={onAddComment}
            />
          )}
          {showEdit && (
            <TaskDialog
              open={showEdit}
              onOpenChange={setShowEdit}
              task={task}
              onSave={(updates) => {
                if (onUpdate) {
                  onUpdate(task.id, updates)
                }
              }}
            />
          )}
          {showDeleteConfirm && (
            <ConfirmDialog
              open={showDeleteConfirm}
              onOpenChange={setShowDeleteConfirm}
              title="Delete Task"
              description="Are you sure you want to delete this task? This action cannot be undone."
              onConfirm={() => {
                if (onDelete) {
                  onDelete(task.id)
                }
              }}
            />
          )}
        </>
      )}
    </Draggable>
  )
}
