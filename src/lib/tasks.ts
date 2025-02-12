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
} from 'firebase/firestore'
import { db } from './firebase'
import { Task } from '@/types'

export interface FirestoreTask extends Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp
  updatedAt: Timestamp
}

function getTasksCollection(userId: string) {
  return collection(db, `users/${userId}/tasks`)
}

export async function createTask(
  userId: string,
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  console.log('Creating task for user:', userId, 'Task data:', task)
  const tasksRef = getTasksCollection(userId)
  
  try {
    const taskDoc = await addDoc(tasksRef, {
      ...task,
      completed: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log('Task created successfully with ID:', taskDoc.id)
    
    // Verify the task was created
    const createdTaskRef = doc(tasksRef, taskDoc.id)
    const createdTaskSnap = await getDoc(createdTaskRef)
    console.log('Created task data:', createdTaskSnap.data())
    
    return taskDoc.id
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

// Helper function to check tasks
export async function listUserTasks(userId: string) {
  console.log('Listing tasks for user:', userId)
  const tasksRef = getTasksCollection(userId)
  const snapshot = await getDocs(tasksRef)
  
  console.log('Found', snapshot.size, 'tasks')
  snapshot.forEach(doc => {
    console.log('Task:', doc.id, doc.data())
  })
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  const taskRef = doc(db, `users/${userId}/tasks/${taskId}`)
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteTask(
  userId: string,
  taskId: string
): Promise<void> {
  const taskRef = doc(db, `users/${userId}/tasks/${taskId}`)
  await deleteDoc(taskRef)
}

export function subscribeToTasks(
  userId: string,
  onTasksUpdate: (tasks: Task[]) => void
): () => void {
  const tasksRef = getTasksCollection(userId)
  const tasksQuery = query(
    tasksRef,
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreTask
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        completed: data.completed,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      }
    })
    onTasksUpdate(tasks)
  })
}
