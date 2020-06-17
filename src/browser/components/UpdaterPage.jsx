// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import propTypes from 'prop-types';
import {Button, Navbar} from 'react-bootstrap';

function InstallButton(props) {
  return (
    <Button
      bsStyle='primary'
      onClick={props.onClickInstall}
      style={{padding: '6px 12px'}}
    >{'업데이트'}</Button>
  );
}

InstallButton.propTypes = {
  notifyOnly: propTypes.bool.isRequired,
  onClickInstall: propTypes.func.isRequired,
  onClickDownload: propTypes.func.isRequired,
};

function UpdaterPage(props) {
  return (
    <div className='UpdaterPage'>
      <Navbar fluid={true} >
        <h1 className='UpdaterPage-heading'>{'신규 업데이트'}</h1>
      </Navbar>
      <div className='container-fluid'>
        <p>{props.isDownloading ? '다운로드 중입니다. (소요시간 : 2분)' : '새로운 버전으로 업데이트 하십시요!'}</p>
      </div>
      {props.isDownloading ?
        <Navbar
          className='UpdaterPage-footer'
          fixedBottom={true}
          fluid={true}
        >
          <div className='pull-right'>
            <Button
              onClick={props.onClickCancel}
              style={{padding: '6px 12px'}}
            >{'취소'}</Button>
          </div>
        </Navbar> :
        <Navbar
          className='UpdaterPage-footer'
          fixedBottom={true}
          fluid={true}
        >
          <div className='pull-right'>
            <InstallButton
              onClickInstall={props.onClickInstall}
            />
          </div>
        </Navbar>
      }
    </div>
  );
}

UpdaterPage.propTypes = {
  appName: propTypes.string.isRequired,
  notifyOnly: propTypes.bool.isRequired,
  isDownloading: propTypes.bool.isRequired,
  progress: propTypes.number,
  onClickInstall: propTypes.func.isRequired,
  onClickDownload: propTypes.func.isRequired,
  onClickReleaseNotes: propTypes.func.isRequired,
  onClickRemind: propTypes.func.isRequired,
  onClickSkip: propTypes.func.isRequired,
  onClickCancel: propTypes.func.isRequired,
};

export default UpdaterPage;
