/*
********************************************
 Copyright © 2022 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import RtmEngine from 'agora-react-native-rtm';

class RTMEngine {
  engine!: RtmEngine;
  private localUID: string = '';
  private channelId: string = '';

  private static _instance: RTMEngine | null = null;

  public static getInstance() {
    if (!RTMEngine._instance) {
      return new RTMEngine();
    }
    return RTMEngine._instance;
  }

  private async createClientInstance() {
    await this.engine.createClient($config.APP_ID);
  }

  private constructor() {
    if (RTMEngine._instance) {
      return RTMEngine._instance;
    }
    RTMEngine._instance = this;
    this.engine = new RtmEngine();
    this.localUID = '';
    this.channelId = '';
    this.createClientInstance();

    return RTMEngine._instance;
  }

  setLoginInfo(localUID: string, channelID: string) {
    this.localUID = localUID;
    this.channelId = channelID;
  }
  get myUID() {
    return this.localUID;
  }
  get myChannelUID() {
    return this.channelId;
  }
}

export default RTMEngine;
