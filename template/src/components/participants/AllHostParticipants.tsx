import React from 'react';
import MeParticipant from './MeParticipant';
import ScreenshareParticipants from './ScreenshareParticipants';
import RemoteParticipants from './RemoteParticipants';
import {useString} from '../../utils/useString';
import useUserList from '../../utils/useUserList';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';

export default function AllHostParticipants(props: any) {
  const {p_style, isHost} = props;
  const localUid = useLocalUid();
  const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const {renderList, renderPosition} = useUserList();
  const getParticipantName = (uid: UidType) => {
    return renderList[uid]?.name || remoteUserDefaultLabel;
  };

  return (
    <>
      {renderPosition.map((uid) =>
        uid === localUid ? (
          <MeParticipant
            name={getParticipantName(uid)}
            p_style={p_style}
            key={uid}
          />
        ) : renderList[uid]?.type === 'screenshare' ? (
          <ScreenshareParticipants
            name={getParticipantName(uid)}
            p_styles={p_style}
            key={uid}
          />
        ) : (
          <RemoteParticipants
            name={getParticipantName(uid)}
            p_styles={p_style}
            user={renderList[uid]}
            uid={uid}
            showControls={renderList[uid]?.type === 'rtc'}
            isHost={isHost}
            key={uid}
          />
        ),
      )}
    </>
  );
}
