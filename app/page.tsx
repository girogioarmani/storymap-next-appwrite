'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddActivityDialog } from '@/components/add-activity-dialog';
import { AddStoryDialog } from '@/components/add-story-dialog';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllUserData, deleteActivity as deleteActivityAction, deleteStory as deleteStoryAction } from '@/lib/actions/database.actions';
import { useRouter } from 'next/navigation';

interface Story {
  $id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  activityId: string;
}

interface Activity {
  $id: string;
  name: string;
  stories: Story[];
}

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getAllUserData();
    
    if (!result.success) {
      // Not authenticated, redirect to sign in
      router.push('/sign-in');
      return;
    }
    
    if (result.data) {
      setActivities(result.data.activities);
      setUser(result.data.user);
    }
    setLoading(false);
  };

  const handleDeleteActivity = async (activityId: string) => {
    const result = await deleteActivityAction(activityId);
    if (result.success) {
      await loadData(); // Reload to get fresh data
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    const result = await deleteStoryAction(storyId);
    if (result.success) {
      await loadData(); // Reload to get fresh data
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Story Map</h1>
            <p className="text-muted-foreground">Plan and organize your user stories</p>
          </div>
          <AddActivityDialog onRefresh={loadData} />
        </div>

        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No activities yet. Create your first activity to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity) => (
                <Card key={activity.$id} className="p-4">
                  <div className="flex items-start gap-2 mb-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{activity.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.$id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {activity.stories.map((story) => (
                      <Card key={story.$id} className="p-3 group relative hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm flex-1">{story.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={story.priority === 'high' ? 'destructive' : story.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {story.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStory(story.$id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{story.description}</p>
                      </Card>
                    ))}
                    <AddStoryDialog activityId={activity.$id} onRefresh={loadData} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
