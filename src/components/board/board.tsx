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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { playTaskCompletionSound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
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

      // Get tasks in destination column with correct status
      const destStatus = destColumn.name === 'Done' ? 'done' : 
                        destColumn.name === 'In Progress' ? 'in-progress' : 
                        destColumn.name === 'To Do' ? 'todo' : 'home'
      
      const destTasks = tasks
        .filter(t => t.status === destStatus)
        .sort((a, b) => (a.position || 0) - (b.position || 0))

      // Calculate new position
      let newPosition: number
      if (destTasks.length === 0) {
        // If the destination list is empty
        newPosition = 1000
      } else if (destination.index === 0) {
        // If moving to the start of a list
        newPosition = destTasks[0].position - 1000
      } else if (destination.index >= destTasks.length) {
        // If moving to the end of a list
        newPosition = destTasks[destTasks.length - 1].position + 1000
      } else {
        // If moving between two tasks
        const before = destTasks[destination.index - 1].position
        const after = destTasks[destination.index].position
        newPosition = Math.floor((before + after) / 2)
      }

      // Update the task with new status and position
      await updateTask(draggableId, {
        status: destStatus,
        position: newPosition,
      })

      // Play completion sound if moved to Done column
      if (destColumn.name === 'Done') {
        const task = tasks.find((t) => t.id === draggableId)
        if (task) {
          playTaskCompletionSound(task.priority)
        }
      }
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
        <Droppable droppableId="board" type="column" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 overflow-auto pb-4"
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
                          <ColumnHeader
                            title={column.name}
                            onRename={(name) => handleUpdateColumn(column.id, name)}
                            onDelete={() => handleDeleteColumn(column.id)}
                            allowDelete={tasks.filter((task) => task.status === column.id).length === 0}
                          />
                        </div>
                        <TaskList
                          columnId={column.id}
                          columnName={column.name}
                          tasks={tasks.filter((task) => task.status === (
                            column.name === 'Done' ? 'done' :
                            column.name === 'In Progress' ? 'in-progress' :
                            column.name === 'To Do' ? 'todo' :
                            'home'
                          ))}
                          onCreateTask={handleCreateTask}
                          onUpdateTask={handleUpdateTask}
                          onDeleteTask={handleDeleteTask}
                          onAddComment={handleAddComment}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}
