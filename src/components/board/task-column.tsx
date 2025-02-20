import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { Task } from '@/types'
import { TaskCard } from './task-card'
import { NewTaskDialog } from './new-task-dialog'
import { cn } from '@/lib/utils'
import { AnimatePresence } from 'framer-motion'
import { ScoreAnimation } from './score-animation'

interface TaskColumnProps {
  title: string
  tasks: Task[]
  status: Task['status']
  allowNewTasks?: boolean
  onTaskDrop?: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask?: (taskId: string) => void
  onCreateTask?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

interface ScorePopup {
  id: number
  score: number
  x: number
  y: number
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
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const nextScoreId = React.useRef(1)

  const handleDragEnd = (result: any) => {
    if (!result.destination || result.destination.droppableId !== status) return
    
    const taskId = result.draggableId
    if (onTaskDrop) {
      onTaskDrop(taskId, status)
      
      // Show score animation when dropping into done column
      if (status === 'done') {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          const score = task.priority === 'high' ? 1000 : task.priority === 'medium' ? 500 : 100
          const id = nextScoreId.current++
          
          // Get drop target position
          const dropTarget = document.getElementById('task-column-' + status)
          const rect = dropTarget?.getBoundingClientRect()
          if (rect) {
            setScorePopups(prev => [...prev, {
              id,
              score,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            }])
            
            // Remove animation after delay
            setTimeout(() => {
              setScorePopups(prev => prev.filter(popup => popup.id !== id))
            }, 500)
          }
        }
      }
    }
  }

  const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (onCreateTask) {
      onCreateTask(task)
    }
  }

  return (
    <>
      <div
        id={'task-column-' + status}
        className="flex flex-col"
      >
        <div className="p-4 border-b border-border bg-muted/50 rounded-t-lg">
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

        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'flex-1 p-4 space-y-3 min-h-[calc(100vh-16rem)] bg-muted/50 rounded-b-lg relative',
                snapshot.isDraggingOver && 'ring-2 ring-primary'
              )}
            >
              <AnimatePresence>
                {scorePopups.map(popup => (
                  <ScoreAnimation
                    key={popup.id}
                    score={popup.score}
                    x={popup.x}
                    y={popup.y}
                  />
                ))}
              </AnimatePresence>

              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onDelete={onDeleteTask}
                />
              ))}
              {tasks.length === 0 && (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  No tasks
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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
