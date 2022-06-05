import * as Sentry from '@sentry/browser';
import * as React from 'react';

import type { BasicUser, ChatMessage } from '../minarets-api/minarets/types';

export interface IChatState {
  messages: ChatMessage[];
  onlineUsers: BasicUser[];
  isWidgetVisible: boolean;
}

interface IChatWidgetAction {
  type: 'HideChatWidget' | 'ShowChatWidget';
}

interface IUpdateMessages {
  type: 'UpdateMessages';
  messages: ChatMessage[];
}

interface IUpdateOnlineUsers {
  type: 'UpdateOnlineUsers';
  onlineUsers: BasicUser[];
}

interface ISendMessage {
  type: 'SendMessage';
  message: ChatMessage;
}

export type ChatAction = IChatWidgetAction | ISendMessage | IUpdateMessages | IUpdateOnlineUsers;

function chatReducer(state: IChatState, action: ChatAction): IChatState {
  try {
    switch (action.type) {
      case 'HideChatWidget':
        return {
          ...state,
          isWidgetVisible: false,
        };
      case 'ShowChatWidget':
        return {
          ...state,
          isWidgetVisible: true,
        };
      case 'UpdateMessages': {
        // Only show the most recent 200 unique messages. A completely arbitrary number...
        const maxMessages = 200;
        const messageIds: Record<string, boolean> = {};
        const messages = [];
        let messageCount = 0;

        for (const message of action.messages) {
          const id = `${message.id}`;
          if (!messageIds[id]) {
            messageIds[id] = true;
            messages.push(message);
            messageCount += 1;

            if (messageCount >= maxMessages) {
              break;
            }
          }
        }

        if (messageCount < maxMessages) {
          for (const message of state.messages) {
            const id = `${message.id}`;
            if (!messageIds[id]) {
              messageIds[id] = true;
              messages.push(message);
              messageCount += 1;

              if (messageCount >= maxMessages) {
                break;
              }
            }
          }
        }

        return {
          ...state,
          messages,
        };
      }
      case 'UpdateOnlineUsers': {
        return {
          ...state,
          onlineUsers: action.onlineUsers,
        };
      }
      case 'SendMessage': {
        return {
          ...state,
          messages: [action.message, ...state.messages],
        };
      }
      default:
        throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
    }
  } catch (ex) {
    Sentry.captureException(ex);
    return state;
  }
}

const ChatStateContext = React.createContext<IChatState | undefined>(undefined);
const ChatDispatchContext = React.createContext<React.Dispatch<ChatAction> | undefined>(undefined);

interface IChatContextProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: IChatContextProviderProps): JSX.Element {
  const [state, dispatch] = React.useReducer(chatReducer, {
    messages: [],
    onlineUsers: [],
    isWidgetVisible: true,
  });

  return (
    <ChatStateContext.Provider value={state}>
      <ChatDispatchContext.Provider value={dispatch}>{children}</ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
}

export function useChatState(): IChatState {
  const context = React.useContext<IChatState | undefined>(ChatStateContext);

  if (typeof context === 'undefined') {
    throw new Error('useChatState must be used within a ChatStateContext');
  }

  return context;
}

export function useChatDispatch(): React.Dispatch<ChatAction> {
  const context = React.useContext<React.Dispatch<ChatAction> | undefined>(ChatDispatchContext);

  if (typeof context === 'undefined') {
    throw new Error('useChatDispatch must be used within a ChatDispatchContext');
  }

  return context;
}
