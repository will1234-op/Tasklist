import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Task } from '@/types'
import { TaskList } from './task-list'
import { useAuth } from '@/contexts/auth-context'
import { createTask, updateTask, deleteTask, subscribeToTasks, listUserTasks } from '@/lib/tasks'

export function Board() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToTasks(user.uid, (newTasks) => {
      setTasks(newTasks)
    })

    return () => unsubscribe()
  }, [user])

  const handleCreateTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return
    try {
      const taskId = await createTask(user.uid, task)
      console.log('Task created with ID:', taskId)
      // List all tasks to verify
      const tasks = await listUserTasks(user.uid)
      console.log('Current tasks in database:', tasks)
    } catch (error) {
      console.error('Error in handleCreateTask:', error)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) return
    await updateTask(user.uid, taskId, updates)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return
    await deleteTask(user.uid, taskId)
  }

  const handleTaskDrop = async (taskId: string, newStatus: Task['status']) => {
    if (!user) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    await handleUpdateTask(taskId, { status: newStatus })
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-3.5rem)] p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          <TaskList
            title="To Do"
            tasks={getTasksByStatus('todo')}
            status="todo"
            onTaskDrop={handleTaskDrop}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
          />
          <TaskList
            title="In Progress"
            tasks={getTasksByStatus('in-progress')}
            status="in-progress"
            onTaskDrop={handleTaskDrop}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
          />
          <TaskList
            title="Review"
            tasks={getTasksByStatus('review')}
            status="review"
            onTaskDrop={handleTaskDrop}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
          />
          <TaskList
            title="Done"
            tasks={getTasksByStatus('done')}
            status="done"
            onTaskDrop={handleTaskDrop}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
          />
        </div>
      </div>
    </DndProvider>
  )
}
