// Global event system for ChatWidget control
export type ChatWidgetOpenEvent =
  | { kind: 'channelName'; channelName: string }
  | { kind: 'channelId'; channelId: string }
  | { kind: 'roadshowStopId'; roadshowStopId: string };

type ChatWidgetEventCallback = (event: ChatWidgetOpenEvent) => void;

let openChatCallback: ChatWidgetEventCallback | null = null;

export const registerChatWidgetHandler = (callback: ChatWidgetEventCallback) => {
  openChatCallback = callback;
};

export const unregisterChatWidgetHandler = () => {
  openChatCallback = null;
};

export const openChatWithChannel = (channelName: string) => {
  openChatCallback?.({ kind: 'channelName', channelName });
};

export const openChatWithChannelId = (channelId: string) => {
  openChatCallback?.({ kind: 'channelId', channelId });
};

export const openChatWithRoadshowStop = (roadshowStopId: string) => {
  openChatCallback?.({ kind: 'roadshowStopId', roadshowStopId });
};

