import React, {useEffect} from 'react';
import {RenderStateInterface, DispatchType} from './Contexts/RtcContext';

// TypeDef
import RtcEngine from 'react-native-agora';

// Agora rtc web sdk
import AgoraRTC from 'agora-rtc-sdk-ng';

import VirtualBackgroundExtension from 'agora-extension-virtual-background';
import wasms from '../../node_modules/agora-extension-virtual-background/wasms/agora-wasm.wasm';

let processor:any;

(async () => {
  const extension = new VirtualBackgroundExtension();
  AgoraRTC.registerExtensions([extension]);
  console.log('VirtualBackground Webpack path', wasms);
  processor = extension.createProcessor();
  await processor.init(wasms);
  processor.setOptions({type: 'color', color: '#000000'});
  // processor.setOptions({type: 'blur', blurDegree: 1});
  await processor.enable();
  
})()

const VirtualBackground: React.FC<{
  children: React.ReactNode;
  uidState: RenderStateInterface;
  engineRef: React.MutableRefObject<RtcEngine>;
}> = ({engineRef, uidState, children}: any) => {
  const {renderList, activeUids} = uidState;
  const [maxUid] = activeUids;
  const videoState = renderList[maxUid].video;
  //
  // useEffect(() => {
  //   console.log('virtual', engineRef.current?.localStream?.video);
  // });
  //
  useEffect(() => {
    console.log('virtual', engineRef.current?.localStream?.video);
    engineRef.current?.localStream?.video
      ?.pipe(processor)
      .pipe(engineRef.current.localStream.video.processorDestination);
  }, [videoState]);


  return (
    <>
      {children}
    </>
  );
};

export default VirtualBackground;
