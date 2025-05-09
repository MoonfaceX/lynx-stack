/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/
// @ts-nocheck

export default function() {
  if ($RuntimeGlobals_onChunksLoaded$) {
    $RuntimeGlobals_onChunksLoaded$.require = function(chunkId) {
      // "1" is the signal for "already loaded"
      return installedChunks[chunkId] === 1;
    };
  }
}
