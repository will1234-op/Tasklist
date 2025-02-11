import { useState, useEffect } from 'react'
import { RootLayout } from './components/layout/root-layout'
import { TaskColumn } from './components/task/task-column'
import { Task } from './types'
import { AuthProvider } from './contexts/auth-context'
import { ProtectedRoute } from './components/auth/protected-route'
import { useAuth } from './contexts/auth-context'
import { createTask, updateTask, deleteTask, subscribeToTasks } from './lib/tasks'
import './styles/globals.css'

function TaskBoard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToTasks(user.uid, (tasks) => {
      setTasks(tasks)
    })

    return () => unsubscribe()
  }, [user])

  const handleTaskDrop = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleCreateTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return

    try {
      await createTask(taskData, user.uid)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Task Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TaskColumn
          title="To Do"
          status="todo"
          tasks={getTasksByStatus('todo')}
          onTaskDrop={handleTaskDrop}
          onDeleteTask={handleDeleteTask}
          onCreateTask={handleCreateTask}
        />
        <TaskColumn
          title="In Progress"
          status="in-progress"
          tasks={getTasksByStatus('in-progress')}
          onTaskDrop={handleTaskDrop}
          onDeleteTask={handleDeleteTask}
          onCreateTask={handleCreateTask}
        />
        <TaskColumn
          title="Review"
          status="review"
          tasks={getTasksByStatus('review')}
          onTaskDrop={handleTaskDrop}
          onDeleteTask={handleDeleteTask}
          onCreateTask={handleCreateTask}
        />
        <TaskColumn
          title="Completed"
          status="completed"
          tasks={getTasksByStatus('completed')}
          onTaskDrop={handleTaskDrop}
          onDeleteTask={handleDeleteTask}
          allowNewTasks={false}
        />
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <RootLayout>
        <ProtectedRoute>
          <TaskBoard />
        </ProtectedRoute>
      </RootLayout>
    </AuthProvider>
  )
}

export default App
