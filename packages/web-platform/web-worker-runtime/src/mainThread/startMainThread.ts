// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import {
  flushElementTreeEndpoint,
  mainThreadStartEndpoint,
  postOffscreenEventEndpoint,
  reportErrorEndpoint,
} from '@lynx-js/web-constants';
import { Rpc } from '@lynx-js/web-worker-rpc';
import { createMarkTimingInternal } from './crossThreadHandlers/createMainthreadMarkTimingInternal.js';
import { OffscreenDocument } from '@lynx-js/offscreen-document/webworker';
import { _onEvent } from '@lynx-js/offscreen-document/webworker';
import { registerUpdateDataHandler } from './crossThreadHandlers/registerUpdateDataHandler.js';
const { prepareMainThreadAPIs } = await import('@lynx-js/web-mainthread-apis');

export function startMainThreadWorker(
  uiThreadPort: MessagePort,
  backgroundThreadPort: MessagePort,
) {
  const uiThreadRpc = new Rpc(uiThreadPort, 'main-to-ui');
  const backgroundThreadRpc = new Rpc(backgroundThreadPort, 'main-to-bg');
  const markTimingInternal = createMarkTimingInternal(backgroundThreadRpc);
  const uiFlush = uiThreadRpc.createCall(flushElementTreeEndpoint);
  const reportError = uiThreadRpc.createCall(reportErrorEndpoint);
  const docu = new OffscreenDocument({
    onCommit: uiFlush,
  });
  uiThreadRpc.registerHandler(postOffscreenEventEndpoint, docu[_onEvent]);
  const { startMainThread } = prepareMainThreadAPIs(
    backgroundThreadRpc,
    docu,
    docu.createElement.bind(docu),
    docu.commit.bind(docu),
    markTimingInternal,
    reportError,
  );
  uiThreadRpc.registerHandler(
    mainThreadStartEndpoint,
    (config) => {
      startMainThread(config).then((runtime) => {
        registerUpdateDataHandler(uiThreadRpc, runtime);
      });
    },
  );
}
