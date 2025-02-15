import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  Timestamp,
  orderBy,
  getDocs,
  getDoc,
  arrayUnion,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { Task, Comment, ActivityLogItem, TaskStatus } from '@/types'
import { auth } from './firebase'

export interface FirestoreTask extends Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activityLog'> {
  createdAt: Timestamp
  updatedAt: Timestamp
  comments?: Array<Omit<Comment, 'createdAt' | 'updatedAt'> & {
    createdAt: Timestamp
    updatedAt: Timestamp
  }>
  activityLog?: Array<Omit<ActivityLogItem, 'createdAt'> & {
    createdAt: Timestamp
  }>
}

function getTasksCollection() {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')
  return collection(db, `users/${userId}/tasks`)
}

// Map column names to task statuses
const columnToStatus: Record<string, TaskStatus> = {
  'Home': 'home',
  'To Do': 'todo',
  'In Progress': 'in-progress',
  'Done': 'done',
}

const statusToColumn: Record<TaskStatus, string> = {
  'home': 'Home',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
}

// Function to migrate tasks with column IDs to proper statuses
export async function migrateTaskStatuses(): Promise<void> {
  const tasksRef = getTasksCollection()
  const snapshot = await getDocs(tasksRef)
  const batch = writeBatch(db)

  for (const doc of snapshot.docs) {
    const task = doc.data() as Task
    // If the status is a column ID or invalid, update it to the correct status
    if (!Object.values(columnToStatus).includes(task.status as TaskStatus)) {
      batch.update(doc.ref, {
        status: 'home', // Set to home since these were likely in the Home column
        updatedAt: serverTimestamp(),
      })
    }
  }

  await batch.commit()
}

// Helper function to safely convert Firestore timestamp to Date
function convertTimestamp(timestamp: Timestamp | null | undefined): Date {
  if (!timestamp) return new Date()
  return timestamp.toDate()
}

export function onTasksSnapshot(onTasksUpdate: (tasks: Task[]) => void): () => void {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')

  const tasksQuery = query(getTasksCollection(), orderBy('position'))

  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreTask
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        comments: data.comments?.map((comment) => ({
          ...comment,
          createdAt: convertTimestamp(comment.createdAt),
          updatedAt: convertTimestamp(comment.updatedAt),
        })) || [],
        activityLog: data.activityLog?.map((item) => ({
          ...item,
          createdAt: convertTimestamp(item.createdAt),
        })) || [],
      }
    })
    onTasksUpdate(tasks)
  })
}

export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activityLog'>
): Promise<string> {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')
  
  console.log('Creating task for user:', userId, 'Task data:', task)
  const tasksRef = getTasksCollection()
  
  try {
    const now = Timestamp.now()
    const taskDoc = await addDoc(tasksRef, {
      ...task,
      completed: false,
      createdAt: now,
      updatedAt: now,
      comments: [],
      activityLog: [{
        id: crypto.randomUUID(),
        type: 'created',
        userId: userId,
        userName: auth.currentUser?.displayName || 'User',
        createdAt: now,
        details: {
          field: 'status',
          newValue: task.status,
        },
      }],
    })

    console.log('Task created with ID:', taskDoc.id)
    return taskDoc.id
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export async function addComment(
  taskId: string,
  content: string
): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')

  const taskRef = doc(getTasksCollection(), taskId)
  const now = Timestamp.now()

  try {
    const taskDoc = await getDoc(taskRef)
    if (!taskDoc.exists()) {
      throw new Error('Task not found')
    }

    const comment = {
      id: crypto.randomUUID(),
      content,
      userId,
      userName: auth.currentUser?.displayName || 'User',
      createdAt: now,
      updatedAt: now,
    }

    const activityLogItem = {
      id: crypto.randomUUID(),
      type: 'commented' as const,
      userId,
      userName: auth.currentUser?.displayName || 'User',
      createdAt: now,
      details: {
        comment: content,
      },
    }

    await updateDoc(taskRef, {
      comments: arrayUnion(comment),
      activityLog: arrayUnion(activityLogItem),
      updatedAt: now,
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')

  const taskRef = doc(getTasksCollection(), taskId)
  const now = Timestamp.now()

  try {
    const taskDoc = await getDoc(taskRef)
    if (!taskDoc.exists()) {
      throw new Error('Task not found')
    }

    const activityLogItems: any[] = []
    Object.entries(updates).forEach(([field, value]) => {
      if (field !== 'updatedAt' && field !== 'activityLog') {
        activityLogItems.push({
          id: crypto.randomUUID(),
          type: 'updated',
          userId,
          userName: auth.currentUser?.displayName || 'User',
          createdAt: now,
          details: {
            field,
            oldValue: taskDoc.data()?.[field],
            newValue: value,
          },
        })
      }
    })

    await updateDoc(taskRef, {
      ...updates,
      updatedAt: now,
      activityLog: arrayUnion(...activityLogItems),
    })
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')

  try {
    await deleteDoc(doc(getTasksCollection(), taskId))
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}
