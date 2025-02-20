import { useState, useMemo } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TaskDialog } from '../task-dialog'
import { cn } from '@/lib/utils'

interface TaskListProps {
  columnId: string
  columnName: string
  tasks: Task[]
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activityLog' | 'position'>) => Promise<void>
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
  onAddComment: (taskId: string, content: string) => Promise<void>
}

const columnToStatus: Record<string, TaskStatus> = {
  'Home': 'home',
  'To Do': 'todo',
  'In Progress': 'in-progress',
  'Done': 'done',
}

export function TaskList({
  columnId,
  columnName,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
}: TaskListProps) {
  const [showNewTask, setShowNewTask] = useState(false)

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0))
  }, [tasks])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowNewTask(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 space-y-2 rounded-lg p-2',
              snapshot.isDraggingOver && 'bg-muted'
            )}
          >
            {sortedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                index={index}
                task={task}
                onDelete={onDeleteTask}
                onUpdate={onUpdateTask}
                onAddComment={onAddComment}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <TaskDialog
        open={showNewTask}
        onOpenChange={setShowNewTask}
        status={columnToStatus[columnName] || 'todo'}
        onSave={async (task) => {
          await onCreateTask(task)
          setShowNewTask(false)
        }}
      />
    </div>
  )
}
