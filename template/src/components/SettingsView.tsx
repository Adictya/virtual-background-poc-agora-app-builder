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
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import SelectDevice from '../subComponents/SelectDevice';
import HostControlView from './HostControlView';
import {useString} from '../utils/useString';
import LanguageSelector from '../subComponents/LanguageSelector';
import {isValidReactComponent, isWeb} from '../utils/common';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useFpe} from 'fpe-api';

const SettingsView = () => {
  const {isHost} = useMeetingInfo();
  const selectInputDeviceLabel = useString('selectInputDeviceLabel')();
  const {SettingsAfterView, SettingsBeforeView} = useFpe((data) => {
    let components: {
      SettingsAfterView: React.ComponentType;
      SettingsBeforeView: React.ComponentType;
    } = {
      SettingsAfterView: React.Fragment,
      SettingsBeforeView: React.Fragment,
    };
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall === 'object'
    ) {
      if (
        data?.components?.videoCall?.settingsPanel &&
        typeof data?.components?.videoCall?.settingsPanel === 'object'
      ) {
        if (
          data?.components?.videoCall?.settingsPanel?.after &&
          isValidReactComponent(
            data?.components?.videoCall?.settingsPanel?.after,
          )
        ) {
          components.SettingsAfterView =
            data?.components?.videoCall?.settingsPanel?.after;
        }
        if (
          data?.components?.videoCall?.settingsPanel?.before &&
          isValidReactComponent(
            data?.components?.videoCall?.settingsPanel?.before,
          )
        ) {
          components.SettingsBeforeView =
            data?.components?.videoCall?.settingsPanel?.before;
        }
      }
    }
    return components;
  });
  return (
    <>
      <SettingsBeforeView />
      <View style={isWeb ? style.settingsView : style.settingsViewNative}>
        <View style={style.main}>
          <View>
            <Text style={style.heading}>{selectInputDeviceLabel}</Text>
            <View style={style.popupPickerHolder}>
              <SelectDevice />
            </View>
          </View>
          {isHost ? <HostControlView /> : <></>}
          <LanguageSelector />
        </View>
      </View>
      <SettingsAfterView />
    </>
  );
};

const style = StyleSheet.create({
  main: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingVertical: 5,
    flexGrow: 1,
    shadowColor: $config.PRIMARY_FONT_COLOR + '80',
    shadowOpacity: 0.5,
    shadowOffset: {width: -2, height: 0},
    shadowRadius: 3,
    paddingHorizontal: 20,
  },
  popupPickerHolder: {
    justifyContent: 'space-around',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
    alignSelf: 'center',
  },
  settingsView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    flex: 1,
  },
  settingsViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
});

export default SettingsView;
