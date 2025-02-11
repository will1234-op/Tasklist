/**
 * Core type definitions for the task management application
 */

export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  category: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  completedAt?: string
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
  allowNewTasks: boolean
}

export interface User {
  id: string
  name: string
  email: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  showCompletedTasks: boolean
  defaultView: 'board' | 'list'
}

export interface CategoryTag {
  id: string
  name: string
  color: string
}
