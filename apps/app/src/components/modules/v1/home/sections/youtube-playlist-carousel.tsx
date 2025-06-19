'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { motion } from 'framer-motion';
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

  // Animation variants - following the hero section pattern
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

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
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className=" px-4 md:px-6">
        {/* Title Section */}
        <motion.div
          className="space-y-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="py-8 text-3xl font-bold tracking-tighter sm:text-5xl">Video Tutorials</h2>
        </motion.div>

        {/* Carousel Section */}
        <motion.div
          className="group relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4">
              {videos.map((video, index) => (
                <CarouselItem key={video.id} className="pl-4 sm:basis-1/2 md:basis-1/3">
                  <motion.div
                    variants={scaleUp}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
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
                              <ExternalLink className="text-white" size={32} />
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="group-hover/item:text-primary line-clamp-2 font-medium transition-colors">
                              {video.title}
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                              {video.channelTitle}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom navigation buttons */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <CarouselPrevious
                  className="bg-primary/90 hover:bg-primary h-10 w-10 border-2 text-black shadow-md"
                  variant="outline"
                >
                  <ChevronLeft className="h-6 w-6 text-black" />
                </CarouselPrevious>
              </motion.div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <CarouselNext
                  className="bg-primary/90 hover:bg-primary h-10 w-10 border-2 text-black shadow-md"
                  variant="outline"
                >
                  <ChevronRight className="h-6 w-6" />
                </CarouselNext>
              </motion.div>
            </div>
          </Carousel>
        </motion.div>

        {/* Counter Section */}
        <motion.div
          className="my-4 flex items-center justify-between justify-self-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <span className="text-muted-foreground text-sm">
            {current} / {count}
          </span>
        </motion.div>
      </div>
    </section>
  );
}

export default YoutubePlaylistCarousel;
