export type TaskStatus = 'home' | 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Comment {
  id: string
  content: string
  userId: string
  userName: string
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLogItem {
  id: string
  type: 'created' | 'updated' | 'commented' | 'status_changed' | 'deleted'
  userId: string
  userName: string
  createdAt: Date
  details: {
    field?: string
    oldValue?: string
    newValue?: string
    comment?: string
  }
}

export interface Column {
  id: string
  name: string
  position: number
  createdAt: any
  updatedAt: any
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: string
  dueDate?: string
  completed: boolean
  position: number
  createdAt: Date
  updatedAt: Date
  comments: Comment[]
  activityLog: ActivityLogItem[]
}
