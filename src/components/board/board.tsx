import { useCallback, useEffect, useState } from 'react'
import { Task, TaskStatus, Column } from '@/types'
import { TaskList } from './task-list'
import { DragDropContext, DropResult, Droppable, Draggable } from '@hello-pangea/dnd'
import { useAuth } from '@/contexts/auth-context'
import {
  onTasksSnapshot,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  migrateTaskStatuses,
} from '@/lib/tasks'
import {
  onColumnsSnapshot,
  createColumn,
  updateColumn,
  deleteColumn,
  initializeDefaultColumns,
} from '@/lib/columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ColumnHeader } from './column-header'
import { TaskCard } from './task-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { playTaskCompletionSound } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { CoinDrop } from '@/components/coin-drop'
import { TaskDialog } from '@/components/task-dialog'

// Map column name to task status
const getTaskStatus = (columnName: string): TaskStatus => {
  switch (columnName.toLowerCase()) {
    case 'done':
      return 'done'
    case 'in progress':
      return 'in-progress'
    case 'to do':
      return 'todo'
    case 'priority':
      return 'priority'
    case 'home':
      return 'home'
    default:
      return 'home'
  }
}

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo')
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const initializeBoard = async () => {
      try {
        await initializeDefaultColumns()
        await migrateTaskStatuses() // Migrate any tasks with old statuses
      } catch (error) {
        console.error('Error initializing board:', error)
      }
    }

    initializeBoard()

    const unsubscribeTasks = onTasksSnapshot((tasks) => {
      setTasks(tasks)
    })

    const unsubscribeColumns = onColumnsSnapshot((columns) => {
      setColumns(columns.sort((a, b) => (a.position || 0) - (b.position || 0)))
    })

    return () => {
      unsubscribeTasks()
      unsubscribeColumns()
    }
  }, [user])

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return

      const { source, destination, draggableId, type } = result

      if (type === 'column') {
        // Handle column reordering
        if (source.index === destination.index) return

        const column = columns.find((col) => col.id === draggableId)
        if (!column) return

        // Calculate new position
        let newPosition: number
        if (destination.index === 0) {
          // Moving to start
          newPosition = columns[0].position - 1000
        } else if (destination.index >= columns.length) {
          // Moving to end
          newPosition = columns[columns.length - 1].position + 1000
        } else {
          // Moving between columns
          const before = columns[destination.index - 1].position
          const after = columns[destination.index].position
          newPosition = Math.floor((before + after) / 2)
        }

        await updateColumn(draggableId, { position: newPosition })
        return
      }

      // Handle task reordering
      const sourceColumn = columns.find((col) => col.id === source.droppableId)
      const destColumn = columns.find((col) => col.id === destination.droppableId)
      if (!sourceColumn || !destColumn) return

      const task = tasks.find((t) => t.id === draggableId)
      if (!task) return

      // Calculate new position
      let newPosition: number
      const tasksInColumn = tasks
        .filter((t) => 
          destColumn.name.toLowerCase() === 'priority'
            ? t.priority === 'high'
            : t.status === getTaskStatus(destColumn.name)
        )
        .sort((a, b) => (a.position || 0) - (b.position || 0))

      if (destination.index === 0) {
        // Moving to start
        const firstTask = tasksInColumn[0]
        newPosition = firstTask ? firstTask.position - 1000 : 0
      } else if (destination.index >= tasksInColumn.length) {
        // Moving to end
        const lastTask = tasksInColumn[tasksInColumn.length - 1]
        newPosition = lastTask ? lastTask.position + 1000 : 1000
      } else {
        // Moving between tasks
        const before = tasksInColumn[destination.index - 1]?.position || 0
        const after = tasksInColumn[destination.index]?.position || 1000
        newPosition = Math.floor((before + after) / 2)
      }

      // Play sound and show score animation when moving to done
      if (destColumn.name.toLowerCase() === 'done' && sourceColumn.name.toLowerCase() !== 'done') {
        playTaskCompletionSound()
        
        // Create a coin drop effect
        const coinDropEl = document.querySelector('.coin-drop') as HTMLElement
        if (coinDropEl) {
          const dropCoinBtn = coinDropEl.querySelector('button[data-priority]') as HTMLButtonElement
          if (dropCoinBtn) {
            // Update button priority before clicking
            dropCoinBtn.setAttribute('data-priority', task.priority === 'high' ? 'true' : 'false')
            dropCoinBtn.click()
          }
        }
        setDraggedTask(task)
      }

      // Update task with appropriate changes
      const updates: Partial<Task> = {
        position: newPosition
      }

      // Update status or priority based on destination column
      if (destColumn.name.toLowerCase() === 'priority') {
        // When moving to priority, keep the current status but update priority
        updates.priority = 'high'
      } else {
        // When moving to any other column, set priority to medium and update status
        updates.priority = 'medium'
        updates.status = getTaskStatus(destColumn.name)
      }

      await updateTask(draggableId, updates)
    },
    [tasks, columns]
  )

  const handleCreateTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activityLog' | 'position'>) => {
    // Get tasks in the same status column
    const tasksInStatus = tasks
      .filter(t => t.status === task.status)
      .sort((a, b) => (a.position || 0) - (b.position || 0))

    const position = tasksInStatus.length > 0
      ? tasksInStatus[tasksInStatus.length - 1].position + 1000
      : 1000

    await createTask({ ...task, position })
  }, [tasks])

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates)
  }, [])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    await deleteTask(taskId)
  }, [])

  const handleAddComment = useCallback(async (taskId: string, content: string) => {
    await addComment(taskId, content)
  }, [])

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return
    await createColumn(newColumnName.trim())
    setNewColumnName('')
    setShowNewColumn(false)
  }

  const handleUpdateColumn = async (columnId: string, name: string) => {
    await updateColumn(columnId, { name })
  }

  const handleDeleteColumn = async (columnId: string) => {
    // Only delete if there are no tasks in the column
    const tasksInColumn = tasks.filter((task) => task.status === columnId)
    if (tasksInColumn.length === 0) {
      await deleteColumn(columnId)
    } else {
      // TODO: Show error message that column must be empty
      console.error('Cannot delete column with tasks')
    }
  }

  const handleAddNewTask = (columnName: string) => {
    setNewTaskStatus(getTaskStatus(columnName))
    setShowNewTaskDialog(true)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Board</h2>
          <Dialog open={showNewColumn} onOpenChange={setShowNewColumn}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Column
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
              </DialogHeader>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateColumn()
                      }
                    }}
                    placeholder="Column name"
                  />
                </div>
                <Button onClick={handleCreateColumn}>Add Column</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-4 overflow-auto pb-4">
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex h-full gap-4"
              >
                {columns.map((column, index) => (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'w-[300px] flex-shrink-0',
                          snapshot.isDragging && 'ring-2 ring-primary'
                        )}
                      >
                        <div className="flex h-full flex-col rounded-lg bg-muted/50 p-4">
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <div className="flex flex-col h-full">
                              <div className="p-4 border-b border-border bg-muted/50 rounded-t-lg">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-medium text-lg">{column.name}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {tasks.filter(task => {
                                        if (column.name.toLowerCase() === 'priority') {
                                          return task.priority === 'high'
                                        }
                                        return task.status === getTaskStatus(column.name) && task.priority !== 'high'
                                      }).length}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleAddNewTask(column.name)}
                                    >
                                      <Plus className="h-4 w-4" />
                                      <span className="sr-only">Add task</span>
                                    </Button>
                                    <ColumnHeader
                                      column={column}
                                      onUpdate={(name) => handleUpdateColumn(column.id, name)}
                                      onDelete={() => handleDeleteColumn(column.id)}
                                      allowDelete={tasks.filter((task) => task.status === getTaskStatus(column.name)).length === 0}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Droppable droppableId={column.id} key={column.id}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={cn(
                                      'flex-1 p-4 space-y-3 min-h-[calc(100vh-16rem)] bg-muted/50 rounded-b-lg relative',
                                      snapshot.isDraggingOver && 'ring-2 ring-primary'
                                    )}
                                  >
                                    {tasks
                                      .filter(task => {
                                        if (column.name.toLowerCase() === 'priority') {
                                          return task.priority === 'high'
                                        }
                                        return task.status === getTaskStatus(column.name) && task.priority !== 'high'
                                      })
                                      .sort((a, b) => (a.position || 0) - (b.position || 0))
                                      .map((task, index) => (
                                        <TaskCard
                                          key={task.id}
                                          task={task}
                                          index={index}
                                          onDelete={handleDeleteTask}
                                          onUpdate={handleUpdateTask}
                                          onAddComment={handleAddComment}
                                        />
                                      ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div className="flex-shrink-0 w-[450px]">
                  <CoinDrop 
                    onComplete={() => {}}
                    isPriority={draggedTask?.priority}
                  />
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </div>
      <TaskDialog
        open={showNewTaskDialog}
        onOpenChange={setShowNewTaskDialog}
        status={newTaskStatus}
        onSave={async (task) => {
          await handleCreateTask(task)
          setShowNewTaskDialog(false)
        }}
      />
    </DragDropContext>
  )
}
