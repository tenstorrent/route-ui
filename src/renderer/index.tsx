import { createRoot } from 'react-dom/client';

import { updateStateOnEvent } from './utils/bridge';

import App from './App';
import { setLogOutputEnabledState } from '../data/store/slices/logging.slice';
import { ElectronEvents } from '../data/Types';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

updateStateOnEvent(ElectronEvents.TOGGLE_LOGGING_PANEL, setLogOutputEnabledState);

// calling IPC exposed from preload script
// window.electron.ipcRenderer.once('ipc-example', (arg) => {
//     // eslint-disable-next-line no-console
//     console.log(arg);
// });
// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
