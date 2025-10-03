'use client';

import { JourneyWithSteps } from '@/lib/types/storymap.types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddJourneyDialog } from './add-journey-dialog';
import { Route } from 'lucide-react';
import { deleteUserJourney } from '@/lib/actions/storymap.actions';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

interface JourneySelectorProps {
  journeys: JourneyWithSteps[];
  selectedJourneyId: string | null;
  epicId: string;
  onSelectJourney: (journeyId: string) => void;
  onRefresh: () => void;
}

export function JourneySelector({
  journeys,
  selectedJourneyId,
  epicId,
  onSelectJourney,
  onRefresh,
}: JourneySelectorProps) {
  const handleDelete = async (journeyId: string) => {
    const result = await deleteUserJourney(journeyId);
    if (result.success) {
      onRefresh();
    }
  };

  if (journeys.length === 0) {
    return (
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Route className="h-4 w-4" />
          <span className="text-sm">No user journeys yet</span>
        </div>
        <AddJourneyDialog epicId={epicId} order={0} onSuccess={onRefresh} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b">
      <Tabs value={selectedJourneyId || undefined} onValueChange={onSelectJourney}>
        <TabsList className="h-12">
          {journeys.map((journey) => (
            <div key={journey.$id} className="relative group">
              <TabsTrigger value={journey.$id} className="gap-2">
                <Route className="h-4 w-4" />
                {journey.name}
              </TabsTrigger>
              {selectedJourneyId === journey.$id && (
                <div 
                  className="absolute -right-2 -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DeleteConfirmationDialog
                    title="Delete User Journey"
                    description="This will permanently delete this user journey and all associated data."
                    itemName={journey.name}
                    itemType="Journey"
                    onConfirm={() => handleDelete(journey.$id)}
                    triggerClassName="h-5 w-5 p-0 text-destructive hover:text-destructive"
                  />
                </div>
              )}
            </div>
          ))}
        </TabsList>
      </Tabs>
      <AddJourneyDialog epicId={epicId} order={journeys.length} onSuccess={onRefresh} />
    </div>
  );
}
