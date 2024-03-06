import { RootState } from 'data/store/createStore';
import { getDockOpenState } from 'data/store/selectors/uiState.selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import GridRender from './GridRender';
import PropertiesPanel from './PropertiesPanel';
import { SideBar } from './components/SideBar';
import TopHeaderComponent from './components/TopHeaderComponent';
import BottomDock from './components/bottom-dock/BottomDock';
import { GridSidebar } from './components/grid-sidebar/GridSidebar';
import './scss/MainRouteRenderer.scss';

export interface MainRouteRendererProps {}

const MainRouteRenderer: React.FC<MainRouteRendererProps> = () => {
    const isDockOpen = useSelector((state: RootState) => getDockOpenState(state));
    const isDetailedViewOpen = useSelector((state: RootState) => state.detailedView.isOpen);

    return (
        <div
            className={`main-route ${isDockOpen ? 'dock-open' : ''} ${isDetailedViewOpen ? 'detailed-view-open' : ''}`}
        >
            <div className='header'>
                <TenstorrentLogo />
                <TopHeaderComponent />
            </div>
            <SideBar />
            <GridSidebar />
            <GridRender />
            <PropertiesPanel />
            <BottomDock />
        </div>
    );
};

export default MainRouteRenderer;
