import * as React from 'react';

import type { ChatMessage } from '../minarets-api/minarets/types';

export interface IChatState {
  messages: ChatMessage[];
  isWidgetVisible: boolean;
}

interface IChatWidgetAction {
  type: 'HideChatWidget' | 'ShowChatWidget';
}

interface IUpdateMessages {
  type: 'UpdateMessages';
  messages: ChatMessage[];
}

type ChatAction = IChatWidgetAction | IUpdateMessages;

function chatReducer(state: IChatState, action: ChatAction): IChatState {
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
      const messages = [...action.messages, ...state.messages];

      if (messages.length > 200) {
        messages.length = 200;
      }

      return {
        ...state,
        messages,
      };
    }
    default:
      throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
  }
}

const ChatStateContext = React.createContext<IChatState | undefined>(undefined);
const ChatDispatchContext = React.createContext<React.Dispatch<ChatAction> | undefined>(undefined);

interface IChatContextProviderProps {
  children: React.ReactNode;
}

export const ChatProvider = ({ children }: IChatContextProviderProps): React.ReactElement<IChatContextProviderProps> => {
  const [state, dispatch] = React.useReducer(chatReducer, {
    messages: [],
    isWidgetVisible: true,
  });

  return (
    <ChatStateContext.Provider value={state}>
      <ChatDispatchContext.Provider value={dispatch}>{children}</ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
};

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
