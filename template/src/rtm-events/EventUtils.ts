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
import {EventSourceEnum} from '../custom-events/types';
import {IQueueEvent} from './types';

type TEventList = Map<string, {once: boolean; listener: IListener}[]>;
type IListener = <T>(t: T) => void;
type TEvents = Record<EventSourceEnum, TEventList> | Record<string, never>;

const EventUtils = (function () {
  'use strict';

  let _events: TEvents = {};
  let _eventsQueue: any = [];

  const _isValidListener = function (listener: any): boolean {
    if (typeof listener === 'function') {
      return true;
    } else if (listener && typeof listener === 'object') {
      return _isValidListener(listener.listener);
    } else {
      return false;
    }
  };

  const _getListeners = function (evt: string, source: EventSourceEnum) {
    var response;
    if (_events.hasOwnProperty(source)) {
      if (_events[source].get(evt)) {
        response = _events[source].get(evt);
      } else {
        _events[source].set(evt, []);
        response = _events[source].get(evt);
      }
    } else {
      _events[source] = new Map();
      _events[source].set(evt, []);
      response = _events[source].get(evt);
    }
    return response;
  };

  const _getListenersAsObject = function (
    evt: string,
    source: EventSourceEnum,
  ) {
    const listeners = _getListeners(evt, source);
    let response: any;

    if (listeners instanceof Array) {
      response = {};
      response[evt] = listeners;
    }

    return response || listeners;
  };

  const _indexOfListener = function (listeners: any, listener: any) {
    var i = listeners.length;
    while (i--) {
      if (listeners[i].listener.toString() === listener.toString()) {
        return i;
      }
    }

    return -1;
  };

  return {
    getEvents(source: EventSourceEnum) {
      return _events[source] || (_events = {});
    },
    addListener(evt: string, listener: any, source: EventSourceEnum) {
      console.log('CUSTOM_EVENT_API addListener', evt, source);
      if (!_isValidListener(listener)) {
        throw new Error('Listener must be a function');
      }
      const listeners = _getListenersAsObject(evt, source);
      const listenerIsWrapped = typeof listener === 'object';
      for (let key in listeners) {
        if (
          listeners.hasOwnProperty(key) &&
          _indexOfListener(listeners[key], listener) === -1
        ) {
          listeners[key].push(
            listenerIsWrapped
              ? listener
              : {
                  listener: listener,
                  once: false,
                },
          );
        }
      }
      return this;
    },
    removeEvent(evt: string, source: EventSourceEnum) {
      let type = typeof evt;
      let events = this.getEvents(source);
      // Remove different things depending on the state of evt
      if (type === 'string') {
        // Remove all listeners for the specified event
        // events[source].delete(evt);
      }
      return this;
    },
    emit(evt: string, args: any) {
      if (!evt) {
        console.log('emitting: event name is empty');
        return;
      }
      let listenersMap = _getListenersAsObject(
        evt,
        args.payload.source || EventSourceEnum.core,
      );
      console.log('CUSTOM_EVENT_API emit listenersMap: ', listenersMap);
      let listeners;
      let listener;
      for (let key in listenersMap) {
        if (listenersMap.hasOwnProperty(key)) {
          listeners = listenersMap[key].slice(0);
          for (let i = 0; i < listeners.length; i++) {
            // If the listener returns true then it shall be removed from the event
            // The function is executed either with a basic call or an apply if there is an args array
            listener = listeners[i];
            if (listener.once === true) {
              EventUtils.removeListener(
                evt,
                args.payload.source,
                listener.listener,
              );
            }
            const newargs = [].slice.call(arguments, 1);
            console.log('CUSTOM_EVENT_API newargs: ', newargs);
            listener.listener.apply(this, newargs || []);
          }
        }
      }
    },
    removeListener(
      evt: string,
      source: EventSourceEnum,
      listenerToRemove: IListener,
    ) {
      let listeners = _getListenersAsObject(evt, source);
      for (let key in listeners) {
        if (listeners.hasOwnProperty(key)) {
          let index = _indexOfListener(listeners[key], listenerToRemove);
          if (index !== -1) {
            listeners[key].splice(index, 1);
          }
        }
      }
      return this;
    },
    queue(q: IQueueEvent) {
      _eventsQueue.push(q);
    },
    dequeue() {
      _eventsQueue.pop();
    },
    tasksInQueue() {
      return _eventsQueue;
    },
    // 1. To add multiple listeners
    // addListeners(evt: string, listeners: any) {
    //   if (Array.isArray(listeners)) {
    //     let i = listeners.length;
    //     while (i--) {
    //       this.addListener.call(this, evt, listeners[i]);
    //     }
    //   }
    // },
    // 2. To add only once listener
    // addOnceListener(evt: string, listener: IListener) {
    //   return this.addListener(evt, {
    //     listener: listener,
    //     once: true,
    //   });
    // },
  };
})();

export default EventUtils;
