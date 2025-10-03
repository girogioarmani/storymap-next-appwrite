'use client';

import { useState } from 'react';
import { createActivity } from '@/lib/actions/database.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddActivityDialogProps {
  onRefresh: () => Promise<void>;
}

export function AddActivityDialog({ onRefresh }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      setLoading(true);
      setError('');
      const result = await createActivity(title.trim());
      if (result.success) {
        setTitle('');
        setOpen(false);
        await onRefresh();
      } else {
        setError(result.error || 'Failed to create activity');
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Activity</DialogTitle>
            <DialogDescription>
              Create a new activity column for organizing your user stories.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="activity-title">Activity Title</Label>
              <Input
                id="activity-title"
                placeholder="e.g., User Management"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading ? 'Creating...' : 'Add Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
