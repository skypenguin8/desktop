// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// eslint-disable-next-line import/no-commonjs
const remote = require('electron').remote;

const window = remote.getCurrentWindow();

// eslint-disable-next-line no-unused-vars
document.getElementById('close').addEventListener('click', (e) => {
  window.close();
});
