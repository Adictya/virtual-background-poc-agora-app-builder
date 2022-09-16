/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
// @ts-nocheck
import React, {useState, useContext, useEffect, useRef} from 'react';
import RtmEngine from 'agora-react-native-rtm';
import {PropsContext, useLocalUid} from '../../agora-rn-uikit';
import ChatContext, {controlMessageEnum} from './ChatContext';
import {RtcContext} from '../../agora-rn-uikit';
import {messageSourceType, messageActionType} from './ChatContext';
import {Platform} from 'react-native';
import {backOff} from 'exponential-backoff';
import {useString} from '../utils/useString';
import {isAndroid, isWeb} from '../utils/common';
import {useRenderContext} from 'fpe-api';
import {
  safeJsonParse,
  timeNow,
  hasJsonStructure,
  getMessageTime,
  get32BitUid,
  adjustUID,
} from '../rtm/utils';
import {EventUtils, EventsQueue, eventMessageType} from '../rtm-events';
import {EventPersistLevel} from '../rtm-events-api';
import RTMEngine from '../rtm/RTMEngine';
import {filterObject} from '../utils';
import useLocalScreenShareUid from '../utils/useLocalShareScreenUid';

export enum UserType {
  ScreenShare = 'screenshare',
}

const stringifyPayload = (
  source: messageSourceType,
  type: messageActionType,
  msg: string,
) => {
  return JSON.stringify({
    source,
    type,
    msg,
  });
};

const parsePayload = (data: string) => {
  return JSON.parse(data);
};

const RtmConfigure = (props: any) => {
  const localUid = useLocalUid();
  const screenShareUid = useLocalScreenShareUid();
  const {callActive} = props;
  const {rtcProps} = useContext(PropsContext);
  const {RtcEngine, dispatch} = useContext(RtcContext);
  const {renderList, renderPosition} = useRenderContext();
  const renderListRef = useRef({renderList: renderList});
  const renderPositionRef = useRef({renderPosition: renderPosition});

  /**
   * inside event callback state won't have latest value.
   * so creating ref to access the state
   */
  useEffect(() => {
    renderPositionRef.current.renderPosition = renderPosition;
  }, [renderPosition]);

  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  const [login, setLogin] = useState<boolean>(false);

  const [hasUserJoinedRTM, setHasUserJoinedRTM] = useState<boolean>(false);
  const [onlineUsersCount, setTotalOnlineUsers] = useState<number>(0);

  //commented for v1 release
  // const userText = useString('remoteUserDefaultLabel')();
  const userText = 'User';
  const pstnUserLabel = useString('pstnUserLabel')();
  //commented for v1 release
  //const getScreenShareName = useString('screenshareUserName');
  const getScreenShareName = (name: string) => `${name}'s screenshare`;

  let engine = useRef<RtmEngine>(null!);
  const timerValueRef: any = useRef(5);

  React.useEffect(() => {
    setTotalOnlineUsers(
      Object.keys(
        filterObject(renderList, ([k, v]) => v?.type === 'rtc' && !v.offline),
      ).length,
    );
  }, [renderList]);

  React.useEffect(() => {
    const handBrowserClose = () => {
      engine.current.leaveChannel(rtcProps.channel);
    };

    if (!isWeb) return;
    window.addEventListener('beforeunload', handBrowserClose);
    // cleanup this component
    return () => {
      window.removeEventListener('beforeunload', handBrowserClose);
    };
  }, []);

  const doLoginAndSetupRTM = async () => {
    try {
      await engine.current.login({
        uid: localUid.toString(),
        token: rtcProps.rtm,
      });
      timerValueRef.current = 5;
      setAttribute();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        doLoginAndSetupRTM();
      }, timerValueRef.current * 1000);
    }
  };

  const setAttribute = async () => {
    const rtmAttributes = [
      {key: 'screenUid', value: String(rtcProps.screenShareUid)},
    ];
    try {
      await engine.current.setLocalUserAttributes(rtmAttributes);
      timerValueRef.current = 5;
      await joinChannel();
      setHasUserJoinedRTM(true);
      await runQueuedEvents();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        setAttribute();
      }, timerValueRef.current * 1000);
    }
  };

  const joinChannel = async () => {
    try {
      await engine.current.joinChannel(rtcProps.channel);
      timerValueRef.current = 5;
      await getMembers();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        joinChannel();
      }, timerValueRef.current * 1000);
    }
  };

  const updateRenderListState = (
    uid: number,
    data: Partial<RenderInterface>,
  ) => {
    dispatch({type: 'UpdateRenderList', value: [uid, data]});
  };

  const getMembers = async () => {
    try {
      await engine.current
        .getChannelMembersBychannelId(rtcProps.channel)
        .then(async (data) => {
          await Promise.all(
            data.members.map(async (member: any) => {
              const backoffAttributes = backOff(
                async () => {
                  const attr = await engine.current.getUserAttributesByUid(
                    member.uid,
                  );
                  if (!attr || !attr.attributes) {
                    throw attr;
                  }
                  for (const key in attr.attributes) {
                    if (
                      attr.attributes.hasOwnProperty(key) &&
                      attr.attributes[key]
                    ) {
                      return attr;
                    } else {
                      throw attr;
                    }
                  }
                },
                {
                  retry: (e, idx) => {
                    console.log(
                      `[retrying] Attempt ${idx}. Fetching ${member.uid}'s name`,
                      e,
                    );
                    return true;
                  },
                },
              );
              try {
                const attr = await backoffAttributes;
                console.log('[user attributes]:', {attr});
                //RTC layer uid type is number. so doing the parseInt to convert to number
                //todo hari check android uid comparsion
                const uid = parseInt(member.uid);
                const screenUid = parseInt(attr?.attributes?.screenUid);
                //start - updating user data in rtc
                const userData = {
                  screenUid: screenUid,
                  //below thing for livestreaming
                  type: 'rtc',
                };
                updateRenderListState(uid, userData);
                //end- updating user data in rtc

                //start - updating screenshare data in rtc
                const screenShareUser = {
                  type: UserType.ScreenShare,
                };
                updateRenderListState(screenUid, screenShareUser);
                //end - updating screenshare data in rtc
                // setting screenshare data
                // name of the screenUid, isActive: false, (when the user starts screensharing it becomes true)
                // isActive to identify all active screenshare users in the call
                for (const [key, value] of Object.entries(attr?.attributes)) {
                  if (hasJsonStructure(value as string)) {
                    const data = {
                      evt: key,
                      value: value,
                    };
                    // Todo:EVENTSUP Add the data to queue, dont add same mulitple events, use set so as to not repeat events
                    EventsQueue.enqueue({
                      data: data,
                      uid: member.uid,
                      ts: timeNow(),
                    });
                  }
                }
              } catch (e) {
                console.error(`Could not retrieve name of ${member.uid}`, e);
              }
            }),
          );
          setLogin(true);
          console.log('RTM init done');
        });
      timerValueRef.current = 5;
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        await getMembers();
      }, timerValueRef.current * 1000);
    }
  };

  const init = async () => {
    engine.current = RTMEngine.getInstance().engine;
    RTMEngine.getInstance().setLoginInfo(localUid.toString(), rtcProps.channel);

    engine.current.on('connectionStateChanged', (evt: any) => {
      //console.log(evt);
    });
    engine.current.on('error', (evt: any) => {
      // console.log(evt);
    });
    engine.current.on('channelMemberJoined', (data: any) => {
      const backoffAttributes = backOff(
        async () => {
          const attr = await engine.current.getUserAttributesByUid(data.uid);
          if (!attr || !attr.attributes) {
            throw attr;
          }
          for (const key in attr.attributes) {
            if (attr.attributes.hasOwnProperty(key) && attr.attributes[key]) {
              return attr;
            } else {
              throw attr;
            }
          }
        },
        {
          retry: (e, idx) => {
            console.log(
              `[retrying] Attempt ${idx}. Fetching ${data.uid}'s name`,
              e,
            );
            return true;
          },
        },
      );
      async function getname() {
        try {
          const attr = await backoffAttributes;
          console.log('[user attributes]:', {attr});
          const uid = parseInt(data.uid);
          const screenUid = parseInt(attr?.attributes?.screenUid);
          //start - updating user data in rtc
          const userData = {
            screenUid: screenUid,
            //below thing for livestreaming
            type: 'rtc',
          };
          updateRenderListState(uid, userData);
          //end- updating user data in rtc

          //start - updating screenshare data in rtc
          const screenShareUser = {
            type: UserType.ScreenShare,
          };
          updateRenderListState(screenUid, screenShareUser);
          //end - updating screenshare data in rtc
        } catch (e) {
          console.error(`Could not retrieve name of ${data.uid}`, e);
        }
      }
      getname();
    });

    engine.current.on('channelMemberLeft', (data: any) => {
      console.log('user left', data);
      // Chat of left user becomes undefined. So don't cleanup
      const uid = data?.uid ? parseInt(data?.uid) : undefined;
      if (!uid) return;
      //updating the rtc data
      updateRenderListState(uid, {
        offline: true,
      });
    });

    engine.current.on('messageReceived', (evt: any) => {
      const {peerId, ts, text} = evt;
      const textObj = parsePayload(text);
      const {type, msg} = textObj;

      const timestamp = getMessageTime(ts);

      const sender = isAndroid ? get32BitUid(peerId) : peerId;

      if (type === messageActionType.Control) {
        switch (msg) {
          case controlMessageEnum.muteVideo:
            RtcEngine.muteLocalVideoStream(true);
            dispatch({
              type: 'LocalMuteVideo',
              value: [0],
            });
            break;
          case controlMessageEnum.muteAudio:
            RtcEngine.muteLocalAudioStream(true);
            dispatch({
              type: 'LocalMuteAudio',
              value: [0],
            });
            break;
          case controlMessageEnum.kickUser:
            dispatch({
              type: 'EndCall',
              value: [],
            });
            break;
          default:
            break;
        }
      } else if (type === eventMessageType.CUSTOM_EVENT) {
        console.log('CUSTOM_EVENT_API: inside custom event type ', evt);
        try {
          eventDispatcher(msg, sender, timestamp);
        } catch (error) {
          console.log('error while dispacthing', error);
        }
      }
    });

    engine.current.on('channelMessageReceived', (evt) => {
      const {uid, channelId, text, ts} = evt;
      const textObj = parsePayload(text);
      const [err, result] = safeJsonParse(text);
      const {type, msg} = textObj;

      const timestamp = getMessageTime(ts);

      const sender = Platform.OS ? get32BitUid(uid) : uid;

      if (channelId === rtcProps.channel) {
        if (
          type === eventMessageType.CONTROL_GROUP ||
          type === messageActionType.Control
        ) {
          let actionMsg = '';
          if (hasJsonStructure(msg)) {
            const [err, result] = safeJsonParse(msg);
            if (!err) {
              const {action} = result;
              actionMsg = action;
            }
          } else {
            actionMsg = msg;
          }
          switch (actionMsg) {
            case controlMessageEnum.muteVideo:
              RtcEngine.muteLocalVideoStream(true);
              dispatch({
                type: 'LocalMuteVideo',
                value: [0],
              });
              break;
            case controlMessageEnum.muteAudio:
              RtcEngine.muteLocalAudioStream(true);
              dispatch({
                type: 'LocalMuteAudio',
                value: [0],
              });
              break;
            default:
              break;
            //   throw new Error('Unsupported message type');
          }
        } else if (type === eventMessageType.CUSTOM_EVENT) {
          console.log('CUSTOM_EVENT_API: inside custom event type ', evt);
          try {
            eventDispatcher(msg, sender, timestamp);
          } catch (error) {
            console.log('error while dispacthing', error);
          }
        }
      }
    });
    doLoginAndSetupRTM();
  };

  const runQueuedEvents = async () => {
    try {
      while (!EventsQueue.isEmpty()) {
        const currEvt = EventsQueue.dequeue();
        await eventDispatcher(currEvt.data, currEvt.uid, currEvt.ts);
      }
    } catch (error) {
      console.log('CUSTOM_EVENT_API:  error while running queue events', error);
    }
  };

  const eventDispatcher = async (
    data: {
      evt: string;
      value: string;
    },
    sender: string,
    ts: number,
  ) => {
    console.log('CUSTOM_EVENT_API: inside eventDispatcher ', data);
    const {evt, value} = data;
    // Step 1: Set local attributes
    if (value?.persistLevel === EventPersistLevel.LEVEL3) {
      const rtmAttribute = {key: evt, value: value};
      await engine.current.addOrUpdateLocalUserAttributes([rtmAttribute]);
    }
    // Step 2: Emit the event
    try {
      const {payload, persistLevel, source} = JSON.parse(value);
      console.log('CUSTOM_EVENT_API:  emiting event..: ');
      EventUtils.emitEvent(evt, source, {payload, persistLevel, sender, ts});
    } catch (error) {
      console.log('CUSTOM_EVENT_API: error while emiting event: ', error);
    }
  };

  const sendMessage = async (msg: string) => {
    if (msg.trim() === '') return;
    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Normal,
      msg,
    );
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      text,
    );
  };

  const sendMessageToUid = async (msg: string, uid: UidType) => {
    if (msg.trim() === '') return;

    const adjustedUID = adjustUID(uid);

    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Normal,
      msg,
    );
    await (engine.current as RtmEngine).sendMessageToPeer({
      peerId: adjustedUID.toString(),
      offline: false,
      text,
    });
  };

  const sendControlMessage = async (msg: string) => {
    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Control,
      msg,
    );
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      text,
    );
  };

  const sendControlMessageToUid = async (msg: string, uid: UidType) => {
    if (msg.trim() === '') return;

    const adjustedUID = adjustUID(uid);

    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Control,
      msg,
    );
    await (engine.current as RtmEngine).sendMessageToPeer({
      peerId: adjustedUID.toString(),
      offline: false,
      text,
    });
  };

  const end = async () => {
    callActive
      ? (RTMEngine.getInstance().destroy(),
        EventUtils.clear(),
        setHasUserJoinedRTM(false),
        // setLogin(false),
        console.log('RTM cleanup done'))
      : {};
  };

  useEffect(() => {
    callActive ? init() : (console.log('waiting to init RTM'), setLogin(true));
    return () => {
      end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtcProps.channel, rtcProps.appId, callActive]);

  return (
    <ChatContext.Provider
      value={{
        hasUserJoinedRTM,
        sendControlMessage,
        sendControlMessageToUid,
        sendMessage,
        sendMessageToUid,
        engine: engine.current,
        localUid: localUid,
        onlineUsersCount,
      }}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
