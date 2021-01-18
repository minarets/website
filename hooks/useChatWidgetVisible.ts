import { useChatDispatch } from '../contexts/ChatContext';

export function useChatWidgetVisible(isVisible: boolean): void {
  const dispatch = useChatDispatch();

  if (isVisible) {
    dispatch({ type: 'ShowChatWidget' });
  } else {
    dispatch({ type: 'HideChatWidget' });
  }
}
