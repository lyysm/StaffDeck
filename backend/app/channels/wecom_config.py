from __future__ import annotations

import logging
import os
from collections.abc import Mapping

logger = logging.getLogger(__name__)

WECOM_WS_HOST = "openws.work.weixin.qq.com"
WECOM_WS_PROXY_MODE_ENV = "STAFFDECK_WECOM_WS_PROXY_MODE"
WECOM_WS_PROXY_MODE_CONFIG_KEY = "wecom_ws_proxy_mode"
WECOM_WS_PROXY_MODES = frozenset({"direct", "system"})


def effective_wecom_ws_proxy_mode(config: Mapping[str, object] | None = None) -> str:
    """Resolve the per-binding mode, falling back to the process setting for legacy bindings."""
    configured = config.get(WECOM_WS_PROXY_MODE_CONFIG_KEY) if config else None
    if configured is None:
        raw_mode = os.getenv(WECOM_WS_PROXY_MODE_ENV, "direct")
        source = WECOM_WS_PROXY_MODE_ENV
    else:
        raw_mode = str(configured)
        source = "企微绑定配置"

    mode = str(raw_mode).strip().lower()
    if mode in WECOM_WS_PROXY_MODES:
        return mode

    logger.warning("企微 WebSocket 代理模式无效: %s=%r,回退为 direct", source, raw_mode)
    return "direct"
