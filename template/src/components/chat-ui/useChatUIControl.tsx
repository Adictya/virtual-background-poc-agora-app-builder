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
import {createHook} from 'fpe-implementation';
import React, {SetStateAction, useState} from 'react';
import {UidInterface} from '../../../agora-rn-uikit';

export interface ChatUIControlInterface {
  groupActive: boolean;
  privateActive: boolean;
  selectedChatUserId: UidInterface['uid'];
  setGroupActive: React.Dispatch<SetStateAction<boolean>>;
  setPrivateActive: React.Dispatch<SetStateAction<boolean>>;
  setSelectedChatUserId: React.Dispatch<SetStateAction<UidInterface['uid']>>;
  message: string;
  setMessage: React.Dispatch<SetStateAction<string>>;
}

const ChatUIControlContext = React.createContext<ChatUIControlInterface>({
  groupActive: false,
  privateActive: false,
  selectedChatUserId: '',
  message: '',
  setGroupActive: () => {},
  setPrivateActive: () => {},
  setSelectedChatUserId: () => {},
  setMessage: () => {},
});

interface ChatUIControlProviderProps {
  children: React.ReactNode;
}

const ChatUIControlProvider = (props: ChatUIControlProviderProps) => {
  const [groupActive, setGroupActive] = useState(false);
  const [privateActive, setPrivateActive] = useState(false);
  const [selectedChatUserId, setSelectedChatUserId] = useState('');
  const [message, setMessage] = useState('');
  return (
    <ChatUIControlContext.Provider
      value={{
        groupActive,
        privateActive,
        selectedChatUserId,
        setGroupActive,
        setPrivateActive,
        setSelectedChatUserId,
        message,
        setMessage,
      }}>
      {props.children}
    </ChatUIControlContext.Provider>
  );
};

const useChatUIControl = createHook(ChatUIControlContext);

export {ChatUIControlProvider, useChatUIControl};
