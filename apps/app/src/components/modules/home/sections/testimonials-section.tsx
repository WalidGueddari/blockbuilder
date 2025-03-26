'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function TestimonialsSection() {
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

  const testimonials = [
    {
      quote:
        'BlockBuilder revolutionized how we approached our blockchain project. We launched our own network in weeks instead of the year we had budgeted for development.',
      author: 'Sarah Johnson',
      title: 'CTO, FinTech Innovations',
      image: '/placeholder.svg?height=100&width=100',
    },
    {
      quote:
        "The no-code approach allowed our business team to directly shape our blockchain network's design without constant developer bottlenecks.",
      author: 'Michael Chen',
      title: 'Product Manager, Chain Solutions',
      image: '/placeholder.svg?height=100&width=100',
    },
    {
      quote:
        'We created a custom blockchain for our gaming metaverse in just three weeks with BlockBuilder. The flexibility to design our own tokenomics was game-changing.',
      author: 'Elena Rodriguez',
      title: 'Founder, MetaPlay Games',
      image: '/placeholder.svg?height=100&width=100',
    },
  ];

  return (
    <section id="testimonials" className="bg-muted/50 relative w-full py-12 md:py-24 lg:py-32">
      <div className="to-background/10 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent"></div>
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="space-y-2">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't just take our word for it. See what our customers have achieved with
              BlockBuilder.
            </p>
          </div>
        </motion.div>
        <motion.div
          className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3 lg:grid-rows-1"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, i) => (
            <motion.div key={i} variants={scaleUp} className="h-full">
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.2 },
                }}
                className="h-full"
              >
                <Card className="flex h-full flex-col text-center">
                  <CardHeader>
                    <motion.div
                      className="border-primary relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border-2"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 10,
                        delay: 0.2 + i * 0.1,
                      }}
                      viewport={{ once: true }}
                    >
                      <Image
                        src={testimonial.image || '/placeholder.svg'}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-4 italic">"{testimonial.quote}"</p>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
