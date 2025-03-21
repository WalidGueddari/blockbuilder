'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export function DemoSection() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [thumbnailRect, setThumbnailRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Animation variants
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

  // Get the thumbnail position for animation
  useEffect(() => {
    if (thumbnailRef.current) {
      const rect = thumbnailRef.current.getBoundingClientRect();
      setThumbnailRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [thumbnailRef]);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle video play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle video mute/unmute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Get video dimensions when it's loaded
  useEffect(() => {
    const handleVideoMetadata = () => {
      if (videoRef.current) {
        const { videoWidth, videoHeight } = videoRef.current;
        setVideoSize({ width: videoWidth, height: videoHeight });
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', handleVideoMetadata);

      // If the video is already loaded, get dimensions now
      if (videoRef.current.readyState >= 1) {
        handleVideoMetadata();
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleVideoMetadata);
      }
    };
  }, [videoRef.current]);

  const openFullscreen = () => {
    if (thumbnailRef.current) {
      const rect = thumbnailRef.current.getBoundingClientRect();
      setThumbnailRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsFullscreen(true);
    setIsPlaying(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when fullscreen
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsPlaying(false);
    document.body.style.overflow = ''; // Re-enable scrolling
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  // Calculate video dimensions to maintain aspect ratio and take 50% of viewport height
  const calculateVideoDimensions = () => {
    if (videoSize.width === 0 || videoSize.height === 0) {
      return { width: '90%', height: '50vh' };
    }

    const aspectRatio = videoSize.width / videoSize.height;
    const height = '50vh';
    const width = `calc(50vh * ${aspectRatio})`;

    return { width, height };
  };

  const videoDimensions = calculateVideoDimensions();

  return (
    <section id="demo" className="relative w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="space-y-2">
              <Badge variant="outline">See It In Action</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Watch How BlockBuilder Works
              </h2>
              <p className="text-muted-foreground max-w-[600px] md:text-xl/relaxed">
                See how easy it is to build and deploy a complete blockchain application in minutes
                without writing any code.
              </p>
            </div>
            <motion.div
              className="flex flex-col gap-2 self-center min-[400px]:flex-row"
              variants={staggerContainer}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={scaleUp}
              >
                <Button
                  size="lg"
                  variant="default"
                  asChild
                  className="from-primary hover:from-primary/90 bg-gradient-to-r to-purple-600 hover:to-purple-600/90"
                >
                  <Link href="/signup">Try It Yourself</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={scaleUp}
              >
                <Button size="lg" variant="outline" asChild>
                  <Link href="/schedule-demo">Schedule a Demo</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex items-center justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleUp}
          >
            <motion.div
              ref={thumbnailRef}
              className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg border shadow-xl"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              onClick={openFullscreen}
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                    delay: 0.3,
                  }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-primary/90 text-primary-foreground h-16 w-16 rounded-full border-4 border-white/20 p-0"
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </motion.div>
              </div>
              <Image
                src="placeholder.svg"
                alt="BlockBuilder Demo Video"
                fill
                className="object-cover"
              />
              <div className="from-primary/20 absolute inset-0 bg-gradient-to-tr to-transparent opacity-60"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFullscreen}
          >
            <motion.div
              ref={videoContainerRef}
              className="relative flex items-center justify-center"
              initial={{
                position: 'fixed',
                top: thumbnailRect.top,
                left: thumbnailRect.left,
                width: thumbnailRect.width,
                height: thumbnailRect.height,
                borderRadius: '0.5rem',
              }}
              animate={{
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                width: videoDimensions.width,
                height: videoDimensions.height,
                borderRadius: '0.75rem',
              }}
              exit={{
                top: thumbnailRect.top,
                left: thumbnailRect.left,
                x: 0,
                y: 0,
                width: thumbnailRect.width,
                height: thumbnailRect.height,
                borderRadius: '0.5rem',
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={videoRef}
                className="h-full w-full rounded-lg object-contain"
                src="/demo.mp4" // Replace with your actual video
                poster="/placeholder.svg"
                controls={false}
                playsInline
              />

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={closeFullscreen}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
