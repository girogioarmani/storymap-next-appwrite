'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { Plus, GripVertical } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface Activity {
  id: string;
  title: string;
  stories: Story[];
}

export default function Home() {
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      title: 'User Management',
      stories: [
        { id: '1-1', title: 'Sign up', description: 'User can create account', priority: 'high' },
        { id: '1-2', title: 'Sign in', description: 'User can login', priority: 'high' },
        { id: '1-3', title: 'Profile', description: 'User can edit profile', priority: 'medium' },
      ],
    },
    {
      id: '2',
      title: 'Story Mapping',
      stories: [
        { id: '2-1', title: 'Create map', description: 'Create new story map', priority: 'high' },
        { id: '2-2', title: 'Add stories', description: 'Add user stories', priority: 'high' },
        { id: '2-3', title: 'Organize', description: 'Drag and drop stories', priority: 'medium' },
      ],
    },
  ]);

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Activity
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="p-4">
                <div className="flex items-start gap-2 mb-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{activity.title}</h3>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {activity.stories.map((story) => (
                    <Card key={story.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm">{story.title}</h4>
                        <Badge 
                          variant={story.priority === 'high' ? 'destructive' : story.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {story.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{story.description}</p>
                    </Card>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    <Plus className="mr-2 h-3 w-3" />
                    Add Story
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
