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
  writeBatch,
} from 'firebase/firestore'
import { auth } from './firebase'
import { Column } from '@/types'

function getColumnsCollection() {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('User must be logged in')
  return collection(db, `users/${userId}/columns`)
}

const defaultColumns = [
  { name: 'Home', position: 1000 },
  { name: 'To Do', position: 2000 },
  { name: 'In Progress', position: 3000 },
  { name: 'Done', position: 4000 },
]

export async function initializeDefaultColumns(): Promise<void> {
  const columnsRef = getColumnsCollection()
  const snapshot = await getDocs(columnsRef)
  
  try {
    if (snapshot.empty) {
      // Create all default columns in parallel if no columns exist
      await Promise.all(
        defaultColumns.map((column) =>
          addDoc(columnsRef, {
            ...column,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
      )
    } else {
      // Check if we need to migrate existing columns to include position
      const batch = writeBatch(db)
      let position = 1000
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (typeof data.position !== 'number') {
          batch.update(doc.ref, { 
            position,
            updatedAt: serverTimestamp()
          })
          position += 1000
        }
      })
      
      await batch.commit()
    }
  } catch (error) {
    console.error('Error initializing/migrating columns:', error)
    throw error
  }
}

export async function createColumn(name: string): Promise<string> {
  const columnsRef = getColumnsCollection()
  
  try {
    // Get all columns to determine the new position
    const snapshot = await getDocs(query(columnsRef, orderBy('position', 'desc')))
    const lastPosition = snapshot.empty ? 0 : snapshot.docs[0].data().position || 0
    const position = lastPosition + 1000

    const columnDoc = await addDoc(columnsRef, {
      name,
      position,
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

export function onColumnsSnapshot(callback: (columns: Column[]) => void) {
  const columnsRef = getColumnsCollection()
  
  return onSnapshot(
    query(columnsRef, orderBy('position')),
    (snapshot) => {
      const columns = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Column[]
      callback(columns)
    },
    (error) => {
      console.error('Error in columns snapshot:', error)
    }
  )
}
