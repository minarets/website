import * as Sentry from '@sentry/browser';
import * as React from 'react';
import type { KeyboardEvent } from 'react';

import type { ChatAction } from '../contexts/ChatContext';
import { useChatDispatch, useChatState } from '../contexts/ChatContext';
import { useInterval } from '../hooks/useInterval';
import type { IListLatestResponse, ISendResponse } from '../minarets-api/minarets/chatMessages';
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

async function sendMessage(text: string, chatDispatch: React.Dispatch<ChatAction>): Promise<void> {
  if (!text || !text.trim()) {
    return;
  }

  const response = await fetch(`/api/minarets/sendChatMessage`, {
    method: 'POST',
    body: text,
  });

  if (response.ok) {
    const sentMessage = (await response.json()) as ISendResponse;
    if (sentMessage.message) {
      chatDispatch({
        type: 'SendMessage',
        message: sentMessage.message,
      });
    }
  } else {
    throw new Error(response.statusText);
  }
}

export default function ChatWidget(): React.ReactElement {
  const [windowIsActive, setWindowIsActive] = React.useState(true);
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);
  const [chatRefreshErrorCount, setChatRefreshErrorCount] = React.useState(0);
  const [hasNotifiedChatError, setHasNotifiedChatError] = React.useState(false);
  const chatState = useChatState();
  const chatDispatch = useChatDispatch();
  const messageContainerRef = React.useRef<HTMLDivElement | null>(null);
  const messageRef = React.useRef<HTMLTextAreaElement | null>(null);

  const onFocus = (): void => setWindowIsActive(true);
  const onBlur = (): void => setWindowIsActive(false);
  const onSendMessage = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey && messageRef.current) {
      setIsSendingMessage(true);
      sendMessage(messageRef.current.value || '', chatDispatch)
        .then(() => {
          if (messageRef.current) {
            messageRef.current.value = '';
          }

          return true;
        })
        .finally(() => {
          setIsSendingMessage(false);
        })
        .catch((ex) => Sentry.captureException(ex));
    }
  };

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

          setChatRefreshErrorCount(0);
          setHasNotifiedChatError(false);
          return true;
        })
        .catch((err) => {
          setChatRefreshErrorCount(chatRefreshErrorCount + 1);
          if (!hasNotifiedChatError && chatRefreshErrorCount > 2) {
            setHasNotifiedChatError(true);
            Sentry.captureException(err);
          }
        });
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
      if (scrollOffset < 150 || isFirstLoad) {
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
      <div className={`${styles.chatInputArea} ${isSendingMessage ? styles.disabledChatInputArea : ''}`}>
        <textarea ref={messageRef} className={styles.chatTextArea} placeholder="Click here to type a chat message." maxLength={4096} onKeyDown={onSendMessage} disabled={isSendingMessage} />
      </div>
    </>
  );
}
