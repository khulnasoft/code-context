'use client'

import { useState, useRef, useEffect } from 'react';
import { Send, MinusCircle, Maximize2, Minimize2, Bot, User, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage, sendChatMessage } from '@/app/lib/actions/chat';
import { MRDetails } from '@/app/lib/actions/mr_analysis/actions';
import { Issue } from '@/app/lib/actions/common/entities/issue';
import Markdown from './ui/markdown';
import { Epic } from '@/app/lib/actions/common/entities/epic';

export default function Chat({ mrDetails, issue, epic }: { mrDetails?: MRDetails | null; issue?: Issue | null; epic?: Epic | null }) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isLarge, setIsLarge] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [mrDetails, issue, epic]);

  if (!mrDetails && !issue && !epic) {
    return null;
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      sender: 'Human',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    if (newMessage === '/reset' || newMessage === '/clear') {
      setMessages([]);
      setNewMessage('');
      return;
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setNewMessage('');

    const stream = await sendChatMessage(newMessages, mrDetails, issue, epic);

    let aiMessage = {
      sender: 'AI',
      content: '',
      timestamp: new Date().toISOString(),
    };

    for await (const chunk of stream) {
      aiMessage = {
        ...aiMessage,
        content: aiMessage.content + chunk,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, aiMessage]);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="sr-only">Open chat</span>
        </Button>
      </div>
    );
  }

  function title() {
    if (mrDetails) {
      return `MR ${mrDetails.title}`;
    } else if (issue) {
      return `Issue ${issue.title}`;
    } else if (epic) {
      return `Epic ${epic.title}`;
    } else {
      return 'Chat';
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-background rounded-lg shadow-lg border transition-all duration-300 ease-in-out flex flex-col ${
        isLarge ? 'w-[48rem] h-[42rem]' : 'w-96 h-[30rem]'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">{title()}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsLarge(!isLarge)}
          >
            {isLarge ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="sr-only">{isLarge ? 'Decrease size' : 'Increase size'}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(true)}
          >
            <MinusCircle className="h-4 w-4" />
            <span className="sr-only">Minimize</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-grow p-4 overflow-x-hidden">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex gap-3 max-w-full">
              <Avatar
                className={`h-8 w-8 ${
                  message.sender === 'AI' ? 'bg-blue-100' : 'bg-green-100'
                }`}
              >
                <AvatarFallback>
                  {message.sender === 'AI' ? (
                    <Bot className="h-4 w-4 text-blue-500" />
                  ) : (
                    <User className="h-4 w-4 text-green-500" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1 max-w-full style={{ maxWidth: 'calc(100% - 2rem)' }}">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{message.sender}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm break-words">
                  <Markdown contents={message.content} />
                </p>
              </div>
            </div>
          ))}
          {/* Add the div with the ref here */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
