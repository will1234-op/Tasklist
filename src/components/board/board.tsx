import { useCallback, useEffect, useState } from 'react'
import { Task, TaskStatus, Column } from '@/types'
import { TaskList } from './task-list'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useAuth } from '@/contexts/auth-context'
import {
  onTasksSnapshot,
  createTask,
  updateTask,
  deleteTask,
  addComment,
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
      } catch (error) {
        console.error('Error initializing board:', error)
      }
    }

    initializeBoard()

    const unsubscribeTasks = onTasksSnapshot((tasks) => {
      setTasks(tasks)
    })

    const unsubscribeColumns = onColumnsSnapshot((columns) => {
      setColumns(columns)
    })

    return () => {
      unsubscribeTasks()
      unsubscribeColumns()
    }
  }, [user])

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return

      const { source, destination, draggableId } = result

      // If task hasn't moved, do nothing
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return
      }

      // Get all tasks in the source and destination lists
      const sourceTasks = tasks.filter((task) => task.status === source.droppableId)
      const destTasks = tasks.filter((task) => task.status === destination.droppableId)

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
        status: destination.droppableId,
        position: newPosition,
      })
    },
    [tasks]
  )

  const handleCreateTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activityLog' | 'position'>) => {
    const tasksInList = tasks.filter((t) => t.status === task.status)
    const position = tasksInList.length > 0
      ? tasksInList[tasksInList.length - 1].position + 1000
      : 1000

    await createTask({ ...task, position, status: task.status })
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
        <div className="grid auto-cols-[300px] grid-flow-col gap-4 overflow-auto">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col rounded-lg bg-muted/50 p-4">
              <ColumnHeader
                title={column.name}
                onRename={(name) => handleUpdateColumn(column.id, name)}
                onDelete={() => handleDeleteColumn(column.id)}
                allowDelete={tasks.filter((task) => task.status === column.id).length === 0}
              />
              <TaskList
                title={column.name}
                tasks={tasks.filter((task) => task.status === column.id)}
                status={column.id}
                columnName={column.name}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddComment={handleAddComment}
              />
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  )
}
