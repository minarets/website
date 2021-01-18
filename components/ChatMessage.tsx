import moment from 'moment';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { ChatMessage } from '../minarets-api/minarets/types';
import styles from '../styles/Chat.module.scss';

interface IProps {
  message: ChatMessage;
  previousMessage?: ChatMessage;
}

function ChatWidget({ message, previousMessage }: IProps): ReactElement {
  let isContinuingPreviousMessage = false;
  if (previousMessage) {
    isContinuingPreviousMessage = message.createdBy.id === previousMessage.createdBy.id && new Date(message.createdOn).getTime() - new Date(previousMessage.createdOn).getTime() > 300000;
  }

  return (
    <div className="pt-2">
      {!isContinuingPreviousMessage && (
        <div className={styles.details}>
          {message.createdBy.id > 0 && <div>{message.createdBy.name}</div>}
          <div>{moment(message.createdOn).format('MMM d, h:mma')}</div>
        </div>
      )}
      <div>{message.text}</div>
    </div>
  );
}

ChatWidget.defaultProps = {
  previousMessage: undefined,
};

export default ChatWidget;
