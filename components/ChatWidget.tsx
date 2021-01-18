import * as Sentry from '@sentry/browser';
import * as React from 'react';

import { useChatDispatch, useChatState } from '../contexts/ChatContext';
import { useInterval } from '../hooks/useInterval';
import type { ChatMessage } from '../minarets-api/minarets/types';

async function getChatMessages(lastMessageId?: number): Promise<ChatMessage[]> {
  const response = await fetch(`/api/minarets/getChatMessages?lastMessageId=${lastMessageId || ''}`);
  if (response.ok) {
    return (await response.json()) as ChatMessage[];
  }

  console.log(`getChatMessages - :(`);
  return [];
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
      getChatMessages(chatState.messages[0]?.id)
        .then((chatMessages: ChatMessage[]) => {
          chatDispatch({
            type: 'UpdateMessages',
            messages: chatMessages,
          });

          return true;
        })
        .catch((err) => Sentry.captureException(err));
    },
    windowIsActive ? 7000 : 30000,
  );

  const;

  return (
    <div className="chat-widget">
      {chatState.messages.map((chatMessage: ChatMessage) => (
        <ChatMessage message={chatMessage} key={chatMessage.id} />
      ))}
    </div>
  );
}
