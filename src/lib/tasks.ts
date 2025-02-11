import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import { Task } from '@/types'

const TASKS_COLLECTION = 'tasks'

export interface FirestoreTask extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp
  updatedAt: Timestamp
  userId: string
}

export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> {
  const taskDoc = await addDoc(collection(db, TASKS_COLLECTION), {
    ...task,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return taskDoc.id
}

export async function updateTask(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, taskId)
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, taskId)
  await deleteDoc(taskRef)
}

export function subscribeToTasks(
  userId: string,
  onTasksUpdate: (tasks: Task[]) => void
): () => void {
  const tasksQuery = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreTask
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      }
    })
    onTasksUpdate(tasks)
  })
}
