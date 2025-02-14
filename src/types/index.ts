/**
 * Core type definitions for the task management application
 */

export interface Task {
  id: string
  title: string
  description: string
  status: string
  position: number
  priority: boolean
  createdAt: Date
  updatedAt: Date
  comments: Comment[]
  activityLog: ActivityLogItem[]
  dueDate?: string
}

export type TaskStatus = string

export interface Column {
  id: string
  name: string
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

export interface Board {
  id: string
  name: string
  columns: Column[]
  createdAt: Date
  updatedAt: Date
}
