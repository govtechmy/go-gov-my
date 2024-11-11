'use client';
import { ReactNode, createContext } from 'react';

export const MessagesContext = createContext<any>({});

export function MessagesProvider({ children, messages }: { children: ReactNode; messages: any }) {
  return <MessagesContext.Provider value={messages}>{children}</MessagesContext.Provider>;
}
