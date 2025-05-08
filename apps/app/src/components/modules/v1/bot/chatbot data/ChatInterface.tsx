'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/services/hooks';
import { createServer, setupServer } from '@/services/v2/serverSlice';
import { startNetwork } from '@/services/v4/blockchainSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import {
  dynamicQuestionSelection,
  generateRecommendation,
  processInitialInput,
} from './blockchainUtils';
import type { Question, Responses } from './types';

type ExtraStep = 'none' | 'buildNetwork' | 'nameNetwork' | 'nodeCount' | 'completed';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Add userId retrieval
  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser.id);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  // Add network creation function
  const createNewNetwork = async (name: string, nodeCount: number) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User authentication required',
        variant: 'destructive',
      });
      return;
    }

    setIsTyping(true);
    try {
      // Step 2: Setup network
      const networkRes = await dispatch(
        startNetwork({
          initNetPayload: { name, userId, nodeCount },
          // vmId: createRes.id,
        }),
      ).unwrap();

      if (!networkRes?.id) throw new Error('Network setup failed');

      // Step 4: Start network
      // await dispatch(
      //   startNetwork({
      //     payload: {
      //       vmId: networkRes.serverId,
      //       networkId: networkRes.id,
      //       nodeCount,
      //     },
      //   }),
      // ).unwrap();

      // Update chat
      setMessages((prev) => [
        ...prev,
        {
          id: `success-${Date.now()}`,
          text: `Network "${name}" created successfully! go the networks overview and refresh it.`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      // Redirect after delay
      router.push(`/network/${networkRes.id}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: `Creation failed: ${errorMessage}`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const [network, setNetwork] = useState<{ name?: string; nodeNumber?: string }>({}); // Correct placement
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I'm your blockchain project consultant. Tell me about your project and I'll help you plan it out.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState('');
  const [currentQuestions, setCurrentQuestions] = React.useState<Question[]>([]);
  const [responses, setResponses] = React.useState<Responses>({});
  const [isQuestioning, setIsQuestioning] = React.useState(false);
  const [extraStep, setExtraStep] = React.useState<ExtraStep>('none');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  React.useEffect(() => {
    scrollToBottom();
  }, [currentQuestions]);

  // Handle initial project description submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If we're in the network naming step, process the input as the network name.
    if (extraStep === 'nameNetwork') {
      // Add the user's network name message.
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Save the network name in state.
      setNetwork((prev) => ({ ...prev, name: input }));

      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `Network named "${input}". Now, how many nodes do you want? (choose 1-4)`,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        setExtraStep('nodeCount');
      }, 1000);
      setInput('');
      return;
    }
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Check if input is a greeting
    const greetingKeywords = ['hi', 'hello', 'hey', 'greetings', 'yo'];
    const welcomeSentences = [
      'Hello! I am your AI agent here to help you with your blockchain project.',
      "Hi there! I'm the AI agent ready to assist you with your blockchain needs.",
      "Hey! I'm your friendly AI agent for blockchain project guidance.",
      "Greetings! I'm here to help you build and plan your blockchain project.",
    ];

    if (greetingKeywords.includes(input.trim().toLowerCase())) {
      const randomGreeting = welcomeSentences[Math.floor(Math.random() * welcomeSentences.length)];
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: randomGreeting,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
      setInput('');
      return;
    }

    // Process blockchain project description
    if (!processInitialInput(input)) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: 'Please clarify what you want.',
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
      setInput('');
      return;
    }

    // Process as project description
    const questions = dynamicQuestionSelection(input);
    setCurrentQuestions(questions);
    setIsQuestioning(questions.length > 0);
    setInput('');

    if (questions.length > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "I'll ask you some questions to better understand your needs:",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Handle answer selection for questions
  const handleAnswer = (question: string, answer: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: question, isUser: false, timestamp: new Date() },
      { id: (Date.now() + 1).toString(), text: answer, isUser: true, timestamp: new Date() },
    ]);

    const newResponses = { ...responses, [question]: answer };
    setResponses(newResponses);
    const remainingQuestions = currentQuestions.filter((q) => q.question !== question);
    setCurrentQuestions(remainingQuestions);

    if (remainingQuestions.length > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      const rec = generateRecommendation(newResponses);
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), text: rec, isUser: false, timestamp: new Date() },
        ]);
        setIsTyping(false);
        setIsQuestioning(false);
        setExtraStep('buildNetwork');
      }, 1500);
    }
  };

  // Handle extra conversation answers
  const handleExtraAnswer = (answer: string) => {
    if (extraStep === 'buildNetwork') {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Do you want to build a blockchain network?',
          isUser: false,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          text: answer,
          isUser: true,
          timestamp: new Date(),
        },
      ]);

      if (answer === 'Yes') {
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: 'What do you want to name your network?',
              isUser: false,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          setExtraStep('nameNetwork');
        }, 1000);
      } else {
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: 'Okay, no additional network will be built. Thank you!',
              isUser: false,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          setExtraStep('completed');
        }, 1000);
      }
    } else if (extraStep === 'nodeCount') {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'How many nodes do you want? (choose 1-4)',
          isUser: false,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          text: answer,
          isUser: true,
          timestamp: new Date(),
        },
      ]);

      setNetwork((prev) => ({ ...prev, nodeNumber: answer }));

      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `Great, building network with ${answer} nodes...`,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        setExtraStep('completed');

        if (network.name && answer) {
          createNewNetwork(network.name, parseInt(answer));
        }
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold">Blockchain Assistant</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex', message.isUser ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'flex max-w-[80%] items-end gap-2 rounded-lg px-4 py-2',
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {!message.isUser && <Bot className="h-4 w-4 shrink-0" />}
                          <div className="flex flex-col gap-1">
                            <p className="text-sm">{message.text}</p>
                            <span className="text-[10px] opacity-50">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex gap-1">
                            <span className="animate-bounce">●</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                              ●
                            </span>
                            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>
                              ●
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {isQuestioning && !isTyping && currentQuestions[0]?.choices.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onAnimationComplete={scrollToBottom}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex justify-start">
                          <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-2">
                            <Bot className="h-4 w-4 shrink-0" />
                            <p className="text-sm">{currentQuestions[0].question}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentQuestions[0].choices.map((choice, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              onClick={() => handleAnswer(currentQuestions[0].question, choice)}
                              className="text-sm"
                            >
                              {choice}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {!isQuestioning && extraStep === 'buildNetwork' && !isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex justify-start">
                          <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-2">
                            <Bot className="h-4 w-4 shrink-0" />
                            <p className="text-sm">Do you want to build a blockchain network?</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleExtraAnswer('Yes')}>
                            Yes
                          </Button>
                          <Button variant="outline" onClick={() => handleExtraAnswer('No')}>
                            No
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    {extraStep === 'nodeCount' && !isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex justify-start">
                          <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-2">
                            <Bot className="h-4 w-4 shrink-0" />
                            <p className="text-sm">How many nodes do you want? (choose 1-4)</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {['1', '2', '3', '4'].map((nodeCount) => (
                            <Button
                              key={nodeCount}
                              variant="outline"
                              onClick={() => handleExtraAnswer(nodeCount)}
                            >
                              {nodeCount}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your blockchain project..."
                    className="min-h-[80px] flex-1 resize-none"
                    disabled={
                      isQuestioning ||
                      isTyping ||
                      extraStep == 'nodeCount' ||
                      extraStep == 'buildNetwork'
                    }
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isQuestioning || isTyping || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <Bot className="h-6 w-6" />
              <span className="sr-only">Open chat</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
