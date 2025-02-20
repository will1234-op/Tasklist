import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Task } from '@/types'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Partial<Task>) => void
  task?: Task // Optional - if provided, we're editing
  status?: string // Required for new tasks
}

export function TaskDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  task,
  status = 'todo'
}: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(false)

  // Reset form when opening/closing or when task changes
  useEffect(() => {
    if (open) {
      if (task) {
        // Editing mode - load task data
        setTitle(task.title)
        setDescription(task.description)
        setPriority(task.priority)
      } else {
        // Create mode - reset form
        setTitle('')
        setDescription('')
        setPriority(false)
      }
    }
  }, [open, task])

  const handleSave = () => {
    if (!title.trim()) return

    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      ...(task ? {} : { status }) // Only include status for new tasks
    }

    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="priority"
              checked={priority}
              onCheckedChange={setPriority}
            />
            <Label htmlFor="priority">Priority</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
