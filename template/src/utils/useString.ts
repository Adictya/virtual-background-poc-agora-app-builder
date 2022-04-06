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
import {useFpe} from 'fpe-api';
import {useLanguage} from '../language/useLanguage';
import {
  TEXTS,
  TextDataInterface,
  DEFAULT_I18_DATA,
  MeetingInviteTextInterface,
  MeetingInviteParam,
  NetworkQualityTextInterface,
  ConditionalTextInferface,
  DynamicTextInterface,
  CombinedTextDataInterface,
} from '../language';

export function usei18nData(
  selectedLanguageCode: string = DEFAULT_I18_DATA.locale,
) {
  const languageData = useFpe((data) => data.i18n);
  if (languageData && languageData.length) {
    if (selectedLanguageCode) {
      let selectedLanguageData = languageData.find(
        (item) => item.locale === selectedLanguageCode,
      );
      if (selectedLanguageData && selectedLanguageData.data) {
        return {
          ...TEXTS,
          ...selectedLanguageData.data,
        };
      } else {
        return TEXTS;
      }
    }
    return {
      ...TEXTS,
      ...languageData[0].data,
    };
  }
  return TEXTS;
}
export function useString(
  keyName: keyof NetworkQualityTextInterface,
  input?: string,
): (input?: NetworkQualityTextInterface) => string;
export function useString(
  keyName: keyof MeetingInviteTextInterface,
  input?: string,
): (input?: MeetingInviteParam) => string;
export function useString(
  keyName: keyof DynamicTextInterface,
  input?: string,
): (input?: string) => string;
export function useString(
  keyName: keyof ConditionalTextInferface,
  input?: string,
): (input?: boolean) => string;
export function useString(
  keyName: keyof TextDataInterface,
  input?: string,
): string;
export function useString(
  keyName: keyof CombinedTextDataInterface,
  input?: string,
): string | ((input?: any) => string) {
  const lanCode = useLanguage((data) => data.languageCode);
  const textData = usei18nData(lanCode);
  if (textData[keyName]) {
    let keyValue = textData[keyName];
    if (typeof keyValue === 'function') {
      return input === undefined ? keyValue : keyValue(input);
    } else if (typeof keyValue === 'string') {
      return keyValue;
    } else {
      return '';
    }
  }
  return '';
}
