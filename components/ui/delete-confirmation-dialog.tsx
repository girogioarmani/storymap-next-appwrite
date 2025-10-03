'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  title: string;
  description: string;
  itemName: string;
  itemType: 'Epic' | 'Journey' | 'Step' | 'Release' | 'Story';
  onConfirm: () => Promise<void>;
  children?: React.ReactNode;
  triggerClassName?: string;
}

export function DeleteConfirmationDialog({
  title,
  description,
  itemName,
  itemType,
  onConfirm,
  children,
  triggerClassName,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isConfirmed = confirmText.toLowerCase() === 'i understand';

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
      setConfirmText('');
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmText('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className={triggerClassName || "h-7 w-7 p-0 text-muted-foreground hover:text-destructive"}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold">{itemType} to delete:</p>
            <p className="text-sm text-muted-foreground font-mono bg-background px-3 py-2 rounded border">
              {itemName}
            </p>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-destructive">Warning: This action cannot be undone!</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {itemType === 'Epic' && (
                    <>
                      <li>All user journeys will be deleted</li>
                      <li>All steps will be deleted</li>
                      <li>All stories will be deleted</li>
                    </>
                  )}
                  {itemType === 'Journey' && (
                    <>
                      <li>All steps will be deleted</li>
                      <li>All stories will be deleted</li>
                    </>
                  )}
                  {itemType === 'Step' && (
                    <>
                      <li>All stories in this step will be deleted</li>
                    </>
                  )}
                  {itemType === 'Release' && (
                    <>
                      <li>Stories will be moved to backlog</li>
                      <li>Release planning will be lost</li>
                    </>
                  )}
                  {itemType === 'Story' && (
                    <>
                      <li>Story details will be permanently lost</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded">I understand</span> to confirm:
            </label>
            <Input
              placeholder="I understand"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={confirmText && !isConfirmed ? 'border-destructive' : ''}
              autoFocus
            />
            {confirmText && !isConfirmed && (
              <p className="text-xs text-destructive">
                Please type exactly: "I understand" (case insensitive)
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete {itemType}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
