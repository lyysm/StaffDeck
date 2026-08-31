// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ChannelBindingRead } from '../../types';
import WecomSetup from './WecomSetup';

const binding: ChannelBindingRead = {
  id: 'binding-wecom',
  tenant_id: 'tenant_demo',
  agent_id: 'agent-1',
  channel: 'wecom',
  status: 'active',
  connected: false,
  bot_id: 'aib_bot1',
  corp_id: 'corpA',
  wecom_ws_proxy_mode: 'direct',
  agents: [],
  created_at: '2026-08-31T00:00:00Z',
  updated_at: '2026-08-31T00:00:00Z',
};

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify(body),
  } as Response;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('WecomSetup', () => {
  it('saves the WebSocket proxy mode for the current binding', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('PUT');
      expect(JSON.parse(String(init?.body))).toEqual({
        tenant_id: 'tenant_demo',
        mode: 'system',
      });
      return jsonResponse({ ...binding, wecom_ws_proxy_mode: 'system' });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<WecomSetup binding={binding} onChanged={onChanged} />);

    const proxySwitch = screen.getByRole('switch', { name: '使用系统代理连接企业微信' });
    expect(proxySwitch.getAttribute('aria-checked')).toBe('false');
    await user.click(proxySwitch);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/enterprise/channels/binding-wecom/wecom/proxy-mode',
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(onChanged).toHaveBeenCalledWith(
        expect.objectContaining({ wecom_ws_proxy_mode: 'system' }),
      );
    });
    expect(screen.getByText('系统代理')).toBeTruthy();
  });
});
