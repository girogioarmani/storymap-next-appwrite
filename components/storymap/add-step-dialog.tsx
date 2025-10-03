'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createStep } from '@/lib/actions/storymap.actions';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AddStepDialogProps {
  journeyId: string;
  order: number;
  onSuccess?: () => void;
}

export function AddStepDialog({ journeyId, order, onSuccess }: AddStepDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createStep({ name, description, journeyId, order });
      if (result.success) {
        setName('');
        setDescription('');
        setOpen(false);
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to create step');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create step');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="w-[280px] shrink-0 flex items-center justify-center h-[150px] border-2 border-dashed cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Add Step</span>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
            <DialogDescription>
              A step represents a single action in the user journey.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Step Name *</Label>
              <Input
                id="name"
                placeholder="E.g., Browse Products"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what happens in this step..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>
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
              {loading ? 'Creating...' : 'Add Step'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
