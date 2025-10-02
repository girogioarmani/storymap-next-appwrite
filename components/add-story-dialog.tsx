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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddStoryDialogProps {
  onAdd: (story: { title: string; description: string; priority: 'high' | 'medium' | 'low' }) => void;
}

export function AddStoryDialog({ onAdd }: AddStoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full mt-2">
          <Plus className="mr-2 h-3 w-3" />
          Add Story
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Story</DialogTitle>
            <DialogDescription>
              Create a new user story for this activity.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="story-title">Story Title</Label>
              <Input
                id="story-title"
                placeholder="e.g., User login"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="story-description">Description</Label>
              <Textarea
                id="story-description"
                placeholder="Describe what the user can do..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="story-priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as 'high' | 'medium' | 'low')}>
                <SelectTrigger id="story-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Story
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
