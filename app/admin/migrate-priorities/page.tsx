'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';

export default function MigratePrioritiesPage() {
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const runMigration = async () => {
    setMigrating(true);
    setResults(null);

    try {
      const response = await fetch('/api/migrate-priorities', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        setResults({
          total: 0,
          updated: 0,
          skipped: 0,
          errors: [data.error || 'Migration failed'],
        });
      }
    } catch (error) {
      setResults({
        total: 0,
        updated: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Migrate Story Priorities</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Priority Migration Tool</h2>
          <p className="text-muted-foreground mb-4">
            This tool will migrate your stories from the old priority system (high/medium/low) 
            to the new MoSCoW prioritization system:
          </p>
          
          <ul className="list-disc list-inside space-y-2 mb-6 text-sm">
            <li><strong>high</strong> → <strong>must</strong> (🔴 Must Have)</li>
            <li><strong>medium</strong> → <strong>should</strong> (🟡 Should Have)</li>
            <li><strong>low</strong> → <strong>could</strong> (🟢 Could Have)</li>
            <li>Any other value → <strong>should</strong> (🟡 Should Have)</li>
          </ul>

          <Button
            onClick={runMigration}
            disabled={migrating}
            size="lg"
            className="w-full"
          >
            {migrating ? 'Migrating...' : 'Run Migration'}
          </Button>
        </Card>

        {results && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Migration Results</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Stories:</span>
                <span className="font-semibold">{results.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span className="font-semibold text-green-600">{results.updated}</span>
              </div>
              <div className="flex justify-between">
                <span>Skipped (already valid):</span>
                <span className="font-semibold text-blue-600">{results.skipped}</span>
              </div>
              
              {results.errors.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-destructive mb-2">Errors:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {results.errors.map((error, index) => (
                      <li key={index} className="text-destructive">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.updated > 0 && results.errors.length === 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-green-600 font-semibold">
                    ✅ Migration completed successfully! Please refresh your story map.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
