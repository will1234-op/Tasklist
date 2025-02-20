import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface ColumnHeaderProps {
  column: Column
  onUpdate: (name: string) => void
  onDelete: () => void
  allowDelete?: boolean
}

export function ColumnHeader({
  column,
  onUpdate,
  onDelete,
  allowDelete = true,
}: ColumnHeaderProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newTitle, setNewTitle] = useState(column.name || '')

  // Update newTitle when title prop changes
  useEffect(() => {
    setNewTitle(column.name || '')
  }, [column.name])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = newTitle.trim()
    if (trimmedTitle && onUpdate && trimmedTitle !== column.name) {
      onUpdate(trimmedTitle)
    }
    setShowRenameDialog(false)
  }

  const handleOpenRename = () => {
    setShowRenameDialog(true)
  }

  const handleCloseRename = () => {
    setShowRenameDialog(false)
    setNewTitle(column.name) // Reset to current title
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleOpenRename}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          {allowDelete && onDelete && (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showRenameDialog} onOpenChange={handleCloseRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter column name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseRename}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Column"
        description="Are you sure you want to delete this column? This action cannot be undone."
        onConfirm={() => {
          onDelete?.()
          setShowDeleteConfirm(false)
        }}
      />
    </>
  )
}
