'use client';

import { Navbar } from '@/components/navbar';
import { StoryMapView } from '@/components/storymap/story-map-view';

export default function Home() {
  return (
    <>
      <Navbar />
      <StoryMapView />
    </>
  );
}
