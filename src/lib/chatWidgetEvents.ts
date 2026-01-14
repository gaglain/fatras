// Global event system for ChatWidget control
type ChatWidgetEventCallback = (channelName: string) => void;

let openChatCallback: ChatWidgetEventCallback | null = null;

export const registerChatWidgetHandler = (callback: ChatWidgetEventCallback) => {
  openChatCallback = callback;
};

export const unregisterChatWidgetHandler = () => {
  openChatCallback = null;
};

export const openChatWithChannel = (channelName: string) => {
  if (openChatCallback) {
    openChatCallback(channelName);
  }
};
