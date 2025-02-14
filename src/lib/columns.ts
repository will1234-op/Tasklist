import { db } from './firebase'
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore'
import { auth } from './firebase'
import { Column } from '@/types'

function getColumnsCollection() {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')
  return collection(db, `users/${userId}/columns`)
}

const defaultColumns = [
  { name: 'To Do' },
  { name: 'In Progress' },
  { name: 'Done' },
]

export async function initializeDefaultColumns(): Promise<void> {
  const columnsRef = getColumnsCollection()
  const snapshot = await getDocs(columnsRef)
  
  // Only initialize if no columns exist
  if (snapshot.empty) {
    try {
      // Create all default columns in parallel
      await Promise.all(
        defaultColumns.map((column) =>
          addDoc(columnsRef, {
            ...column,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
      )
    } catch (error) {
      console.error('Error initializing default columns:', error)
      throw error
    }
  }
}

export async function createColumn(name: string): Promise<string> {
  const columnsRef = getColumnsCollection()
  
  try {
    const columnDoc = await addDoc(columnsRef, {
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return columnDoc.id
  } catch (error) {
    console.error('Error creating column:', error)
    throw error
  }
}

export async function updateColumn(
  columnId: string,
  updates: Partial<Column>
): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')

  const columnRef = doc(getColumnsCollection(), columnId)

  try {
    await updateDoc(columnRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating column:', error)
    throw error
  }
}

export async function deleteColumn(columnId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')

  try {
    await deleteDoc(doc(getColumnsCollection(), columnId))
  } catch (error) {
    console.error('Error deleting column:', error)
    throw error
  }
}

export function onColumnsSnapshot(
  onColumnsUpdate: (columns: Column[]) => void
): () => void {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')

  const columnsQuery = query(getColumnsCollection(), orderBy('createdAt'))

  return onSnapshot(columnsQuery, (snapshot) => {
    const columns = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Column[]
    onColumnsUpdate(columns)
  })
}
