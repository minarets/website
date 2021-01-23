import * as Sentry from '@sentry/browser';
import * as React from 'react';

import { useChatDispatch, useChatState } from '../contexts/ChatContext';
import { useInterval } from '../hooks/useInterval';
import type { IListLatestResponse } from '../minarets-api/minarets/chatMessages';
import type { ChatMessage } from '../minarets-api/minarets/types';

import ChatMessageRow from './ChatMessageRow';

async function getChatMessages(isPassive: boolean, lastMessageId?: number): Promise<IListLatestResponse> {
  const url = isPassive ? '/api/minarets/getPassiveChatMessages' : '/api/minarets/getChatMessages';
  const lastMessageUrl = lastMessageId ? `/${lastMessageId}` : '';
  const response = await fetch(`${url}${lastMessageUrl}`);
  if (response.ok) {
    return (await response.json()) as IListLatestResponse;
  }

  console.log(`getChatMessages - :(`);
  return {
    messages: [],
  };
}

export default function ChatWidget(): React.ReactElement {
  const [windowIsActive, setWindowIsActive] = React.useState(true);
  const chatState = useChatState();
  const chatDispatch = useChatDispatch();

  const onFocus = (): void => setWindowIsActive(true);
  const onBlur = (): void => setWindowIsActive(false);

  React.useEffect(() => {
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    // Clean up when component is unmounted
    return (): void => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useInterval(
    (): void => {
      getChatMessages(!windowIsActive, chatState.messages[0]?.id)
        .then((response: IListLatestResponse) => {
          chatDispatch({
            type: 'UpdateMessages',
            messages: response.messages || [],
          });

          if (response.onlineUsers) {
            chatDispatch({
              type: 'UpdateOnlineUsers',
              onlineUsers: response.onlineUsers,
            });
          }

          return true;
        })
        .catch((err) => Sentry.captureException(err));
    },
    windowIsActive ? 7000 : 30000,
  );

  return (
    <div className="chat-widget">
      {chatState.messages.map((chatMessage: ChatMessage) => (
        <ChatMessageRow message={chatMessage} key={chatMessage.id} />
      ))}
    </div>
  );
}
