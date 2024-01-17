import { createRoot } from 'react-dom/client';

import { updateStateOnEvent } from './utils/bridge';

import App from './App';
import { setLogOutputEnabled } from '../data/store/slices/logging.slice';
import { ElectronEvents } from '../main/ElectronEvents';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

updateStateOnEvent(ElectronEvents.TOGGLE_LOG_OUTPUT, setLogOutputEnabled);
