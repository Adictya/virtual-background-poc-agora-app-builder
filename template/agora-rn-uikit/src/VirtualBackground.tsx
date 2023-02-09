import React, {useEffect, useRef, useContext} from 'react';
import {RenderStateInterface, DispatchType} from './Contexts/RtcContext';
//@ts-ignore
import google from '../../src/assets/google.png';

// TypeDef
import RtcEngine from 'react-native-agora';

// Agora rtc web sdk
import AgoraRTC from 'agora-rtc-sdk-ng';

import VirtualBackgroundExtension, {
  IVirtualBackgroundProcessor,
} from 'agora-extension-virtual-background';

import wasms from '../../node_modules/agora-extension-virtual-background/wasms/agora-wasm.wasm';

import PropsContext, {ClientRole} from './Contexts/PropsContext';

const VirtualBackground: React.FC<{
  children: React.ReactNode;
  uidState: RenderStateInterface;
  engineRef: React.MutableRefObject<RtcEngine>;
}> = ({engineRef, uidState, children}: any) => {
  const {renderList, activeUids} = uidState;
  const {rtcProps} = useContext(PropsContext);
  const [maxUid] = activeUids;
  const videoState = renderList[maxUid].video;

  const ext = useRef(new VirtualBackgroundExtension());
  const processor = useRef<IVirtualBackgroundProcessor>();

  useEffect(() => {
    if (rtcProps.role === ClientRole.Audience) return;
    const initExtension = async () => {
      AgoraRTC.registerExtensions([ext.current]);
      processor.current = ext.current.createProcessor();
      await processor.current.init(wasms);
    };
    initExtension();
    enableBackground();
    return () => {
      disableBackground();
    };
  }, [videoState]);

  const enableBackground = async () => {
    // @ts-ignore
    let htmlElement = document.createElement('img');
    // htmlElement.crossorigin = 'anonymous'
    htmlElement.src = '/google.png';

    htmlElement.onload = async () => {
      const localVideoTrack = engineRef.current?.localStream?.video;
      if (processor.current && localVideoTrack) {
        localVideoTrack
          .pipe(processor.current)
          .pipe(localVideoTrack.processorDestination);
        processor.current.setOptions({type: 'img', source: htmlElement});
        await processor.current.enable();
      }
    };
  };

  const disableBackground = async () => {
    if (processor.current) {
      processor.current.unpipe();
      await processor.current.disable();
    }
  };

  return <>{children}</>;
};

export default VirtualBackground;
