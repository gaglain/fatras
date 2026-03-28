import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const { mockSubscribe, mockOn, mockRemoveChannel, mockChannel } = vi.hoisted(() => {
  const mockSubscribe = vi.fn();
  const mockOn = vi.fn().mockReturnThis();
  const mockRemoveChannel = vi.fn();
  const mockChannel = vi.fn(() => ({ on: mockOn, subscribe: mockSubscribe }));
  return { mockSubscribe, mockOn, mockRemoveChannel, mockChannel };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  },
}));

import { useRealtimeUpdates } from '../useRealtimeUpdates';

describe('useRealtimeUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOn.mockReturnThis();
  });

  it('creates a channel with deterministic name', () => {
    renderHook(() =>
      useRealtimeUpdates([{ table: 'contacts' }, { table: 'events' }])
    );
    expect(mockChannel).toHaveBeenCalledWith('rt-contacts-events');
  });

  it('subscribes to postgres_changes for each table', () => {
    renderHook(() => useRealtimeUpdates([{ table: 'contacts' }]));
    expect(mockOn).toHaveBeenCalledTimes(3);
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('cleans up channel on unmount', () => {
    const { unmount } = renderHook(() =>
      useRealtimeUpdates([{ table: 'contacts' }])
    );
    unmount();
    expect(mockRemoveChannel).toHaveBeenCalled();
  });

  it('does not recreate channel if tables unchanged', () => {
    const { rerender } = renderHook(
      ({ configs }) => useRealtimeUpdates(configs),
      { initialProps: { configs: [{ table: 'contacts' as const }] } }
    );
    const callCount = mockChannel.mock.calls.length;
    rerender({ configs: [{ table: 'contacts' as const }] });
    expect(mockChannel.mock.calls.length).toBe(callCount);
  });
});
