import { createRoot } from 'react-dom/client';

import { updateStateOnEvent } from './utils/bridge';

import { toggleClusterView, toggleQueuesTable } from '../data/store/slices/experimentalFeatures.slice';
import { setLogOutputEnabled } from '../data/store/slices/logging.slice';
import { ElectronEvents } from '../main/ElectronEvents';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

updateStateOnEvent(ElectronEvents.TOGGLE_LOG_OUTPUT, setLogOutputEnabled);
updateStateOnEvent(ElectronEvents.TOGGLE_QUEUES_TABLE, toggleQueuesTable, true);
updateStateOnEvent(ElectronEvents.TOGGLE_CLUSTER_VIEW, toggleClusterView, true);
