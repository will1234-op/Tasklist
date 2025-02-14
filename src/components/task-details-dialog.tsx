import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Task, Comment, ActivityLogItem } from '@/types'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { X, MessageSquare, History, Calendar, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TaskDetailsDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddComment: (taskId: string, content: string) => void
}

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  onAddComment,
}: TaskDetailsDialogProps) {
  const [newComment, setNewComment] = useState('')
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments')

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    onAddComment(task.id, newComment)
    setNewComment('')
  }

  const renderCommentList = () => {
    if (task.comments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mb-2" />
          <p>No comments yet</p>
          <p className="text-sm">Be the first to comment on this task</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {task.comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{comment.userName}</span>
              <span className="text-sm text-muted-foreground">
                {format(comment.createdAt, 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    )
  }

  const renderActivityLog = () => {
    if (task.activityLog.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <History className="h-8 w-8 mb-2" />
          <p>No activity yet</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {task.activityLog.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="mt-1">
              {activity.type === 'created' && <Tag className="h-4 w-4" />}
              {activity.type === 'updated' && <History className="h-4 w-4" />}
              {activity.type === 'commented' && <MessageSquare className="h-4 w-4" />}
              {activity.type === 'status_changed' && <Calendar className="h-4 w-4" />}
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{activity.userName}</span>
                <span className="text-muted-foreground">
                  {format(activity.createdAt, 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {activity.type === 'created' && <p>created this task</p>}
              {activity.type === 'updated' && (
                <p>
                  updated {activity.details.field} from "{activity.details.oldValue}" to "
                  {activity.details.newValue}"
                </p>
              )}
              {activity.type === 'commented' && (
                <p>commented: {activity.details.comment}</p>
              )}
              {activity.type === 'status_changed' && (
                <p>
                  moved task from {activity.details.oldValue} to{' '}
                  {activity.details.newValue}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="mb-4">
            <Dialog.Title className="text-xl font-semibold">
              {task.title}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {task.description}
            </Dialog.Description>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-muted px-2 py-1">
              Status: {task.status}
            </span>
            <span className="rounded-full bg-muted px-2 py-1">
              Priority: {task.priority}
            </span>
            {task.category && (
              <span className="rounded-full bg-muted px-2 py-1">
                Category: {task.category}
              </span>
            )}
            {task.dueDate && (
              <span className="rounded-full bg-muted px-2 py-1">
                Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>

          <div className="mb-4 flex gap-4 border-b">
            <button
              className={cn(
                'px-4 py-2 text-sm font-medium',
                activeTab === 'comments'
                  ? 'border-b-2 border-primary'
                  : 'text-muted-foreground'
              )}
              onClick={() => setActiveTab('comments')}
            >
              Comments
            </button>
            <button
              className={cn(
                'px-4 py-2 text-sm font-medium',
                activeTab === 'activity'
                  ? 'border-b-2 border-primary'
                  : 'text-muted-foreground'
              )}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>

          <div className="max-h-[400px] space-y-4 overflow-y-auto">
            {activeTab === 'comments' ? (
              <>
                {renderCommentList()}
                <form onSubmit={handleAddComment} className="sticky bottom-0 mt-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="mb-2"
                  />
                  <Button type="submit" disabled={!newComment.trim()}>
                    Add Comment
                  </Button>
                </form>
              </>
            ) : (
              renderActivityLog()
            )}
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
