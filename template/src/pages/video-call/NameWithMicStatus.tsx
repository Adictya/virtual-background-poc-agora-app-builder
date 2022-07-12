import React, {useContext} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {ImageIcon, RenderInterface} from '../../../agora-rn-uikit';
import TextWithTooltip from '../../subComponents/TextWithTooltip';
import ColorContext from '../../components/ColorContext';
import {useString} from '../../utils/useString';

export const NameWithMicStatus = ({user}: {user: RenderInterface}) => {
  const {primaryColor} = useContext(ColorContext);
  const {height, width} = useWindowDimensions();
  const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  return (
    <>
      <View style={[style.MicBackdrop]}>
        <ImageIcon
          name={user.audio ? 'mic' : 'micOff'}
          color={user.audio ? primaryColor : 'red'}
          style={style.MicIcon}
        />
      </View>
      <View style={{flex: 1}}>
        <TextWithTooltip
          value={user.name || remoteUserDefaultLabel}
          style={[
            style.name,
            {
              fontSize: RFValue(14, height > width ? height : width),
            },
          ]}
        />
      </View>
    </>
  );
};

const style = StyleSheet.create({
  name: {
    color: $config.PRIMARY_FONT_COLOR,
    lineHeight: 25,
    fontWeight: '700',
    flexShrink: 1,
  },
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});
