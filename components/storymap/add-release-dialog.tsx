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
import { Plus } from 'lucide-react';
import { createRelease } from '@/lib/actions/release.actions';

interface AddReleaseDialogProps {
  journeyId: string;
  order: number;
  onSuccess?: () => void;
}

const RELEASE_PRESETS = [
  { emoji: '🎯', name: 'MVP' },
  { emoji: '🚀', name: 'Phase 1' },
  { emoji: '✨', name: 'Phase 2' },
  { emoji: '💎', name: 'Phase 3' },
  { emoji: '📦', name: 'Backlog' },
];

export function AddReleaseDialog({ journeyId, order, onSuccess }: AddReleaseDialogProps) {
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
      const result = await createRelease({
        name,
        description,
        journeyId,
        order,
      });

      if (result.success) {
        setName('');
        setDescription('');
        setOpen(false);
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to create release');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetName: string) => {
    setName(presetName);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Release
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Release</DialogTitle>
            <DialogDescription>
              Create a horizontal swim lane to group stories by release or iteration.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Preset buttons */}
            <div className="grid gap-2">
              <Label>Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {RELEASE_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(`${preset.emoji} ${preset.name}`)}
                    className="text-sm"
                  >
                    {preset.emoji} {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Release Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Release Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 🎯 MVP or Phase 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use emojis to make releases visually distinct
              </p>
            </div>

            {/* Release Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what's included in this release..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="bg-muted p-3 rounded-md text-xs">
              <p className="font-medium mb-1">💡 Releases are swim lanes:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Span horizontally across all steps</li>
                <li>Group stories by iteration or release</li>
                <li>Help with MVP scoping and planning</li>
                <li>Stories can be moved between releases</li>
              </ul>
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
              {loading ? 'Creating...' : 'Create Release'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
