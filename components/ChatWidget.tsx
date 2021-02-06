import * as Sentry from '@sentry/browser';
import * as React from 'react';

import { useChatDispatch, useChatState } from '../contexts/ChatContext';
import { useInterval } from '../hooks/useInterval';
import type { IListLatestResponse } from '../minarets-api/minarets/chatMessages';
import type { ChatMessage } from '../minarets-api/minarets/types';
import styles from '../styles/Chat.module.scss';

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
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);
  const chatState = useChatState();
  const chatDispatch = useChatDispatch();
  const messageContainerRef = React.useRef<HTMLDivElement | null>(null);

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
    windowIsActive,
  );

  React.useEffect(() => {
    if (messageContainerRef.current) {
      const messageContainer = messageContainerRef.current;
      const containerHeight = messageContainer.clientHeight;
      const scrollTop = messageContainer.scrollTop;
      const scrollOffset = messageContainer.scrollHeight - (scrollTop + containerHeight);
      if (scrollOffset < 75 || isFirstLoad) {
        if (messageContainer.scrollTo) {
          messageContainer.scrollTo(0, 9999999);
        } else {
          messageContainer.scrollTop = 9999999;
        }

        if (isFirstLoad && chatState.messages.length) {
          setIsFirstLoad(false);
        }
      }
    }
  }, [chatState, isFirstLoad]);

  const oldestFirstMessages = chatState.messages.slice().reverse();

  return (
    <>
      <div className={styles.messageContainer} ref={messageContainerRef}>
        {oldestFirstMessages.map((chatMessage: ChatMessage) => (
          <ChatMessageRow message={chatMessage} key={chatMessage.id} />
        ))}
      </div>
      {/*      <div className={styles.chatInputArea}>
        <textarea className={styles.chatTextArea} placeholder="Click here to type a chat message." maxLength={4096}></textarea>
      </div>*/}
    </>
  );
}
