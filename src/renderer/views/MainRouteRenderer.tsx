import {
    getDetailedViewHeight,
    getDetailedViewOpenState,
    getDockOpenState,
} from 'data/store/selectors/uiState.selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import { INITIAL_DETAILS_VIEW_HEIGHT } from '../../data/constants';
import TenstorrentLogo from '../../main/assets/TenstorrentLogo';
import GridRender from '../components/GridRender';
import { SideBar } from '../components/SideBar';
import TopHeaderComponent from '../components/TopHeaderComponent';
import BottomDock from '../components/bottom-dock/BottomDock';
import { GridSidebar } from '../components/grid-sidebar/GridSidebar';
import PropertiesPanel from '../components/properties-panel/PropertiesPanel';
import './MainRouteRenderer.scss';

export interface MainRouteRendererProps {}

const MainRouteRenderer: React.FC<MainRouteRendererProps> = () => {
    const isDockOpen = useSelector(getDockOpenState);
    const isDetailedViewOpen = useSelector(getDetailedViewOpenState);
    const detailedViewHeight = useSelector(getDetailedViewHeight);

    return (
        <div
            className={`main-route ${isDockOpen ? 'dock-open' : ''} ${isDetailedViewOpen ? 'detailed-view-open' : ''}`}
            style={
                {
                    '--js-bottom-dock-height': `${isDetailedViewOpen ? detailedViewHeight : INITIAL_DETAILS_VIEW_HEIGHT}px`,
                } as React.CSSProperties
            }
        >
            <div className='header'>
                <TenstorrentLogo />
                <TopHeaderComponent />
            </div>
            <SideBar />
            <GridSidebar />
            <GridRender />
            <PropertiesPanel />
            <BottomDock isActive={isDockOpen} />
        </div>
    );
};

export default MainRouteRenderer;
