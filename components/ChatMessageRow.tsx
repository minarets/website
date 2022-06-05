import type { Node } from 'domhandler';
import { isTag, isText } from 'domutils';
import { parseDocument } from 'htmlparser2';
import moment from 'moment';
import Link from 'next/link';
import * as React from 'react';

import type { ChatMessage } from '../minarets-api/minarets/types';
import styles from '../styles/Chat.module.scss';

interface IProps {
  message: ChatMessage;
  previousMessage?: ChatMessage;
}

function Smiley({ text, prefixWithSpace }: { text: string; prefixWithSpace: boolean }): JSX.Element {
  switch (text) {
    case ':)':
    case ':-)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/smile.gif" alt=":)" />
        </>
      );
    case ':(':
    case ':-(':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/sad.gif" alt=":(" />
        </>
      );
    case ':D':
    case ':-D':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/biggrin.gif" alt=":D" />
        </>
      );
    case ';)':
    case ';-)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/wink.gif" alt=";)" />
        </>
      );
    case ':|':
    case ':-|':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/eh.gif" alt=":|" />
        </>
      );
    case ':/':
    case ':-/':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/hrm.gif" alt=":/" />
        </>
      );
    case ':O':
    case ':-O':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/oh.gif" alt=":O" />
        </>
      );
    case ':P':
    case ':-P':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/tongue.gif" alt=":P" />
        </>
      );
    case ':(|)':
    case '(monkey)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/monkey.gif" alt="(monkey)" />
        </>
      );
    case ':@)':
    case '(pig)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/pig.gif" alt=":@)" />
        </>
      );
    case '(cake)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/cake.png" alt="(cake)" />
        </>
      );
    case '(chipotle)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/chipotle.png" alt="(chipotle)" />
        </>
      );
    case '(firedancer)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/firedancer.png" alt="(firedancer)" />
        </>
      );
    case '<3':
    case '&lt;3':
    case '(heart)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/heart.png" alt="(heart)" />
        </>
      );
    case '(loko)':
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          <img src="/images/smileys/loko.png" alt="(loko)" />
        </>
      );
    default:
      return (
        <>
          {prefixWithSpace ? ' ' : ''}
          {text}
        </>
      );
  }
}

function TextOrLink({ text, prefixWithSpace }: { text: string; prefixWithSpace: boolean }): JSX.Element {
  if (/^http?s:\/\//i.test(text)) {
    const isInternalLink = /^http?s:\/\/(meetattheshow\.com|minarets\.io)/i.test(text);
    let href = text;
    let textWithMinaretsUrl = text;
    if (isInternalLink) {
      href = text
        .replace(/^http?s:\/\/(meetattheshow\.com|minarets\.io)/i, '')
        .replace(/^\/(concerts|artists|compilations|playlists)\/detail/i, '/$1')
        .toLowerCase();

      textWithMinaretsUrl = `https://minarets.io${href}`;
    }

    return (
      <>
        {prefixWithSpace ? ' ' : ''}
        <Link href={href}>
          <a target={isInternalLink ? '' : '_blank'}>{textWithMinaretsUrl}</a>
        </Link>
      </>
    );
  }

  return <span>{`${prefixWithSpace ? ' ' : ''}${text}`}</span>;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
function TextOrImage({ node, expandTextLinks }: { node: Node; expandTextLinks: boolean }): JSX.Element | null {
  if (isText(node)) {
    // Skip empty text node
    if (/^\s*$/.test(node.data)) {
      return null;
    }

    if (expandTextLinks && node.data.includes('http')) {
      const parts: string[] = node.data.split(/\s/);
      return (
        <>
          {parts.map((part, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <TextOrLink text={part} prefixWithSpace={!!index} key={`${part}_${index}`} />
          ))}
        </>
      );
    }

    if (node.data.includes(':') || node.data.includes('(')) {
      const parts: string[] = node.data.split(/\s/);
      return (
        <>
          {parts.map((part, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Smiley text={part} key={`${part}_${index}`} prefixWithSpace={!!index} />
          ))}
        </>
      );
    }

    return <Smiley text={node.data} prefixWithSpace={false} />;
  }

  if (isTag(node) && node.name === 'img' && node.attribs.src) {
    const src = node.attribs.src.replace(/^\/?content\//i, '/');

    return <img src={src} alt={node.attribs.alt || ''} />;
  }

  return null;
}

function MessageText({ text }: { text: string }): JSX.Element {
  // Do not show more than 2 blank lines in a row
  const document = parseDocument(text.replace(/[\n\r]{3,}/, '\n\n'), { decodeEntities: true });

  // Chat text is very simple. It can contain an image tag, a link tag, or a bold tag. All other html tags are unsupported
  return (
    <>
      {document.childNodes.map((node: Node, nodeIndex: number) => {
        if (isText(node) || (isTag(node) && node.name === 'img' && node.attribs.src)) {
          // eslint-disable-next-line react/no-array-index-key
          return <TextOrImage node={node} expandTextLinks key={`img_${text}_${nodeIndex}`} />;
        }

        if (isTag(node) && node.name === 'b') {
          /* eslint-disable react/no-array-index-key */
          return (
            <b>
              {node.children.map((child: Node, childIndex: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <TextOrImage node={child} expandTextLinks={false} key={`b_${text}_${nodeIndex}_${childIndex}`} />
              ))}
            </b>
          );
          /* eslint-enable react/no-array-index-key */
        }

        if (isTag(node) && node.name === 'a' && node.attribs.href) {
          const href: string = (node.attribs.href || '').replace('https://meetattheshow.com', '').replace(/^\/concerts\/detail/i, '/concerts');
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Link href={href} key={`${text}_${nodeIndex}`}>
              <a>
                {node.children.map((child: Node, childIndex: number) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <TextOrImage node={child} expandTextLinks={false} key={`a_${text}_${nodeIndex}_${childIndex}`} />
                ))}
              </a>
            </Link>
          );
        }

        return null;
      })}
    </>
  );
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */

function ChatMessageRow({ message, previousMessage }: IProps): JSX.Element {
  const createdOnMoment = moment(message.createdOn);
  const isSystemMessage = message.createdBy.id < 1;
  const isToday = createdOnMoment.isSame(moment(), 'day');
  const isYesterday = !isToday && createdOnMoment.isSame(moment().subtract(1, 'day'), 'day');
  const isTodayHistory = isSystemMessage && message.text.startsWith('Today in dmb history');

  let isContinuingPreviousMessage = false;
  if (previousMessage) {
    if (message.createdBy.id === previousMessage.createdBy.id) {
      const previousCreatedOnMoment = moment(previousMessage.createdOn);
      if (isToday) {
        isContinuingPreviousMessage = previousCreatedOnMoment.diff(createdOnMoment, 'minutes') < 5;
      } else {
        isContinuingPreviousMessage = previousCreatedOnMoment.diff(createdOnMoment, 'hours') < 2;
      }
    }
  }

  return (
    <div className="pt-2">
      {!isContinuingPreviousMessage && !isTodayHistory && (
        <div className={styles.messageDetails}>
          {!isSystemMessage && <div>{message.createdBy.name}</div>}
          <div className={!isSystemMessage ? styles.messageDate : ''} title={createdOnMoment.format('MMMM D, h:mma')}>
            {isToday && `Today at ${createdOnMoment.format('h:mma')}`}
            {isYesterday && `Yesterday at ${createdOnMoment.format('h:mma')}`}
            {!isToday && !isYesterday && createdOnMoment.format('MMM D')}
          </div>
        </div>
      )}
      <div className={`${styles.messageText} ${isSystemMessage ? styles.systemMessage : ''}`}>
        <MessageText text={message.text} />
      </div>
    </div>
  );
}

ChatMessageRow.defaultProps = {
  previousMessage: undefined,
};

export default ChatMessageRow;
