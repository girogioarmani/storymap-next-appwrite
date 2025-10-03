'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createStory } from '@/lib/actions/storymap.actions';
import { updateStoryRelease } from '@/lib/actions/release.actions';
import { Plus } from 'lucide-react';
import { Release } from '@/lib/types/storymap.types';

interface AddStoryDialogProps {
  stepId: string;
  order: number;
  releases?: Release[];
  onSuccess?: () => void;
}

export function AddStoryDialog({ stepId, order, releases, onSuccess }: AddStoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'must' | 'should' | 'could' | 'wont'>('should');
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createStory({ title, description, stepId, priority, order });
      if (result.success && result.data) {
        // Update the story's releaseId (can be null for backlog)
        if (releaseId !== null) {
          await updateStoryRelease(result.data.$id, releaseId || null);
        }
        
        setTitle('');
        setDescription('');
        setPriority('should');
        setReleaseId(null);
        setOpen(false);
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to create story');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full border-2 border-dashed mt-2" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Story
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add User Story</DialogTitle>
            <DialogDescription>
              Create an implementation option or feature for this step.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Story Title *</Label>
              <Input
                id="title"
                placeholder="As a user, I want to..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the user story..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">MoSCoW Priority *</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'must' | 'should' | 'could' | 'wont')}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="must">🔴 Must Have - Critical for MVP</SelectItem>
                  <SelectItem value="should">🟡 Should Have - Important but not vital</SelectItem>
                  <SelectItem value="could">🟢 Could Have - Desirable but not necessary</SelectItem>
                  <SelectItem value="wont">⚪ Won't Have - Not planned for this release</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {releases && releases.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="release">Release (optional)</Label>
                <Select 
                  value={releaseId || 'backlog'} 
                  onValueChange={(v) => setReleaseId(v === 'backlog' ? null : v)}
                >
                  <SelectTrigger id="release">
                    <SelectValue placeholder="📦 Backlog (no release)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">📦 Backlog (no release)</SelectItem>
                    {releases.map((release) => (
                      <SelectItem key={release.$id} value={release.$id}>
                        {release.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Add Story'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
