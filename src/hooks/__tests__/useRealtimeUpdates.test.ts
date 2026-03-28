import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRealtimeUpdates } from '../useRealtimeUpdates';

// Mock supabase
const mockSubscribe = vi.fn().mockReturnValue(undefined);
const mockRemoveChannel = vi.fn();

const mockChannelBuilder = {
  on: vi.fn().mockReturnThis(),
  subscribe: mockSubscribe,
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => mockChannelBuilder),
    removeChannel: mockRemoveChannel,
  },
}));

describe('useRealtimeUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a channel with deterministic name', () => {
    const { supabase } = require('@/integrations/supabase/client');

    renderHook(() =>
      useRealtimeUpdates([{ table: 'contacts' }, { table: 'events' }])
    );

    // Channel name should be deterministic (sorted tables)
    expect(supabase.channel).toHaveBeenCalledWith('rt-contacts-events');
  });

  it('subscribes to postgres_changes for each table', () => {
    renderHook(() =>
      useRealtimeUpdates([{ table: 'contacts' }])
    );

    // Should have 3 .on() calls (INSERT, UPDATE, DELETE)
    expect(mockChannelBuilder.on).toHaveBeenCalledTimes(3);
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
    const { supabase } = require('@/integrations/supabase/client');

    const { rerender } = renderHook(
      ({ configs }) => useRealtimeUpdates(configs),
      {
        initialProps: {
          configs: [{ table: 'contacts' }],
        },
      }
    );

    const callCount = supabase.channel.mock.calls.length;

    // Rerender with same tables
    rerender({ configs: [{ table: 'contacts' }] });

    // Should not create a new channel
    expect(supabase.channel.mock.calls.length).toBe(callCount);
  });
});
