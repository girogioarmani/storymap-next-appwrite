'use client';

import { useState } from 'react';
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
  onAdd: (title: string) => void;
}

export function AddActivityDialog({ onAdd }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      setOpen(false);
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
            <div className="grid gap-2">
              <Label htmlFor="activity-title">Activity Title</Label>
              <Input
                id="activity-title"
                placeholder="e.g., User Management"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
