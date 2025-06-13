'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export function YoutubePlaylistCarousel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchYouTubePlaylist() {
      try {
        setLoading(true);
        const YOUTUBE_API_KEY = 'AIzaSyAI3SOcXWh4N4BCj3M1PTB9XaNWbmk9AhE';
        const PLAYLIST_ID = 'PLOWYONwL-oj0hrg6IEt59qQ5BHM_rAFt3';

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`,
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'Error fetching playlist');
        }

        setVideos(
          data.items.map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
          })),
        );
      } catch (err) {
        console.error('Error fetching YouTube playlist:', err);
        setError(err instanceof Error ? err.message : 'Failed to load videos');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchYouTubePlaylist();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-red-500">Error: {error}</p>
        <p className="mt-2">Please try again later</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full py-10 text-center">
        <p>No videos found in this playlist.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-2">
        <h2 className="py-8 text-3xl font-bold tracking-tighter sm:text-5xl">Video Tutorials</h2>
      </div>

      <div className="group relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {videos.map((video) => (
              <CarouselItem key={video.id} className="pl-4 sm:basis-1/2 md:basis-1/3">
                <Link
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/item block"
                >
                  <Card className="overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={video.thumbnail || '/placeholder.svg?height=720&width=1280'}
                          alt={video.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/item:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover/item:opacity-100">
                          <ExternalLink
                            className="text-white opacity-0 transition-opacity group-hover/item:opacity-100"
                            size={32}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="group-hover/item:text-primary line-clamp-2 font-medium transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">{video.channelTitle}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Custom navigation buttons positioned on left and right sides */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <CarouselPrevious
              className="bg-primary/90 hover:bg-primary h-10 w-10 border-2 text-black shadow-md"
              variant="outline"
            >
              <ChevronLeft className="h-6 w-6 text-black" />
            </CarouselPrevious>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <CarouselNext
              className="bg-primary/90 hover:bg-primary h-10 w-10 border-2 text-black shadow-md"
              variant="outline"
            >
              <ChevronRight className="h-6 w-6" />
            </CarouselNext>
          </div>
        </Carousel>
      </div>
      <div className="my-4 flex items-center justify-between justify-self-center">
        <span className="text-muted-foreground text-sm">
          {current} / {count}
        </span>
      </div>
    </div>
  );
}

export default YoutubePlaylistCarousel;
