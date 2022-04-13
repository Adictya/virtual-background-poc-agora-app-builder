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
import {Platform} from 'react-native';
import * as ReactIs from 'react-is';

const cmpTypeGuard = (
  FallBackComponent: React.ComponentType,
  FpeComponent?: React.ElementType,
) => {
  return FpeComponent && ReactIs.isValidElementType(FpeComponent) ? (
    <FpeComponent />
  ) : (
    <FallBackComponent />
  );
};

const getCmpTypeGuard = (
  FallBackComponent: React.ComponentType,
  FpeComponent?: React.ElementType,
) => {
  return FpeComponent && ReactIs.isValidElementType(FpeComponent)
    ? FpeComponent
    : FallBackComponent;
};

const hasBrandLogo: boolean = !!$config.LOGO;

const shouldAuthenticate: boolean =
  $config.ENABLE_APPLE_OAUTH ||
  $config.ENABLE_GOOGLE_OAUTH ||
  $config.ENABLE_MICROSOFT_OAUTH ||
  $config.ENABLE_SLACK_OAUTH;

const isWeb = Platform.OS === 'web';
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';
export {
  hasBrandLogo,
  shouldAuthenticate,
  isWeb,
  isIOS,
  isAndroid,
  cmpTypeGuard,
  getCmpTypeGuard,
};
