import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useFpe} from 'fpe-api';
import Navbar from '../../components/Navbar';
import ParticipantsView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';
import Controls from '../../components/Controls';
import Chat from '../../components/Chat';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {isValidReactComponent, isWeb} from '../../utils/common';
import {useSidePanel} from '../../utils/useSidePanel';
import VideoComponent from './VideoComponent';
import {videoView} from '../../../theme.json';

const VideoCallScreen = () => {
  const {sidePanel} = useSidePanel();
  const {
    ChatComponent,
    VideocallComponent,
    BottombarComponent,
    ParticipantsComponent,
    SettingsComponent,
    TopbarComponent,
    VideocallBeforeView,
    VideocallAfterView,
  } = useFpe((data) => {
    let components: {
      VideocallComponent?: React.ComponentType;
      ChatComponent: React.ComponentType;
      BottombarComponent: React.ComponentType;
      ParticipantsComponent: React.ComponentType;
      SettingsComponent: React.ComponentType;
      TopbarComponent: React.ComponentType;
      VideocallBeforeView: React.ComponentType;
      VideocallAfterView: React.ComponentType;
    } = {
      BottombarComponent: Controls,
      TopbarComponent: Navbar,
      ChatComponent: Chat,
      ParticipantsComponent: ParticipantsView,
      SettingsComponent: SettingsView,
      VideocallAfterView: React.Fragment,
      VideocallBeforeView: React.Fragment,
    };
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall !== 'object' &&
      isValidReactComponent(data?.components?.videoCall)
    ) {
      components.VideocallComponent = data?.components?.videoCall;
    }
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall === 'object'
    ) {
      if (
        data?.components?.videoCall?.after &&
        isValidReactComponent(data?.components?.videoCall?.after)
      ) {
        components.VideocallAfterView = data?.components?.videoCall?.after;
      }
      if (
        data?.components?.videoCall?.before &&
        isValidReactComponent(data?.components?.videoCall?.before)
      ) {
        components.VideocallBeforeView = data?.components?.videoCall?.before;
      }

      if (
        data?.components?.videoCall.chat &&
        typeof data?.components?.videoCall.chat !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.chat)
      ) {
        components.ChatComponent = data?.components?.videoCall.chat;
      }

      if (
        data?.components?.videoCall.bottomBar &&
        typeof data?.components?.videoCall.bottomBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.bottomBar)
      ) {
        components.BottombarComponent = data?.components?.videoCall.bottomBar;
      }

      if (
        data?.components?.videoCall.topBar &&
        typeof data?.components?.videoCall.topBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.topBar)
      ) {
        components.TopbarComponent = data?.components?.videoCall.topBar;
      }

      if (
        data?.components?.videoCall.participantsPanel &&
        typeof data?.components?.videoCall.participantsPanel !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.participantsPanel)
      ) {
        components.ParticipantsComponent =
          data?.components?.videoCall.participantsPanel;
      }

      if (
        data?.components?.videoCall.settingsPanel &&
        typeof data?.components?.videoCall.settingsPanel !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.settingsPanel)
      ) {
        components.SettingsComponent =
          data?.components?.videoCall.settingsPanel;
      }
    }

    return components;
  });

  return VideocallComponent ? (
    <VideocallComponent />
  ) : (
    <>
      <VideocallBeforeView />
      <View style={style.full}>
        <TopbarComponent />
        <View style={[style.videoView, {backgroundColor: '#ffffff00'}]}>
          <VideoComponent />
          {sidePanel === SidePanelType.Participants ? (
            <ParticipantsComponent />
          ) : (
            <></>
          )}
          {sidePanel === SidePanelType.Chat ? (
            $config.CHAT ? (
              <ChatComponent />
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
          {sidePanel === SidePanelType.Settings ? <SettingsComponent /> : <></>}
        </View>
        {!isWeb && sidePanel === SidePanelType.Chat ? (
          <></>
        ) : (
          <BottombarComponent />
        )}
      </View>
      <VideocallAfterView />
    </>
  );
};
export default VideoCallScreen;
//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  videoView: videoView,
});
