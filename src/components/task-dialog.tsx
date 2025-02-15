import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Label } from './ui/label'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: { title: string; description: string; priority: boolean }) => void
}

export function TaskDialog({ open, onOpenChange, onSave }: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(false)

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
    })
    setTitle('')
    setDescription('')
    setPriority(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSave()
                }
              }}
              placeholder="Task title"
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
            <Label htmlFor="priority">Priority Task</Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Create Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
