import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimpleMessaging } from '../useSimpleMessaging';

describe('useSimpleMessaging', () => {
  it('returns default channels', () => {
    const { result } = renderHook(() => useSimpleMessaging());
    expect(result.current.channels.length).toBeGreaterThanOrEqual(3);
    expect(result.current.channels.map(c => c.id)).toContain('general');
  });

  it('adds a message to a channel', () => {
    const { result } = renderHook(() => useSimpleMessaging());

    act(() => {
      result.current.addMessage('general', {
        senderId: 'user1',
        sender: 'Alice',
        message: 'Hello!',
        time: '12:00',
        isMe: true,
        channel: 'general',
      });
    });

    const messages = result.current.getMessages('general');
    expect(messages.some(m => m.message === 'Hello!')).toBe(true);
  });

  it('creates a new channel', () => {
    const { result } = renderHook(() => useSimpleMessaging());

    let newId: string;
    act(() => {
      newId = result.current.createChannel('Test Channel');
    });

    expect(result.current.channels.some(c => c.id === newId!)).toBe(true);
  });

  it('marks channel as read', () => {
    const { result } = renderHook(() => useSimpleMessaging());

    // Add a message from someone else to create unread
    act(() => {
      result.current.addMessage('dev', {
        senderId: 'other',
        sender: 'Bob',
        message: 'Hey',
        time: '13:00',
        isMe: false,
        channel: 'dev',
      });
    });

    const devBefore = result.current.channels.find(c => c.id === 'dev');
    expect(devBefore?.unread).toBeGreaterThan(0);

    act(() => {
      result.current.markChannelAsRead('dev');
    });

    const devAfter = result.current.channels.find(c => c.id === 'dev');
    expect(devAfter?.unread).toBe(0);
  });
});
