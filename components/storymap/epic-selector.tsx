'use client';

import { Epic } from '@/lib/types/storymap.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target } from 'lucide-react';
import { deleteEpic } from '@/lib/actions/storymap.actions';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

interface EpicSelectorProps {
  epics: Epic[];
  selectedEpicId: string | null;
  onSelectEpic: (epicId: string) => void;
  onRefresh: () => void;
}

export function EpicSelector({
  epics,
  selectedEpicId,
  onSelectEpic,
  onRefresh,
}: EpicSelectorProps) {
  const selectedEpic = epics.find((e) => e.$id === selectedEpicId);

  const handleDelete = async () => {
    if (!selectedEpicId) return;
    const result = await deleteEpic(selectedEpicId);
    if (result.success) {
      onRefresh();
    }
  };

  if (epics.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Target className="h-5 w-5" />
        <span className="text-sm">No epics yet. Create one to get started!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Target className="h-5 w-5 text-primary" />
      <Select value={selectedEpicId || undefined} onValueChange={onSelectEpic}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select an epic" />
        </SelectTrigger>
        <SelectContent>
          {epics.map((epic) => (
            <SelectItem key={epic.$id} value={epic.$id}>
              {epic.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedEpic && (
        <DeleteConfirmationDialog
          title="Delete Epic"
          description="This will permanently delete this epic and all of its associated data."
          itemName={selectedEpic.name}
          itemType="Epic"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
