// 1. Import Events
import Events from '../src/rtm-events-api/Events';
import {EventSource} from '../src/rtm-events-api';

// 2. Initialize with source "fpe"
const fpeEvents = new Events(EventSource.fpe);

// 3. export
export {fpeEvents as customEvents};
