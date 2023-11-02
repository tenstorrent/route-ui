import React from 'react';
import { useSelector } from 'react-redux';
import './scss/MainRouteRenderer.scss';
import GridRender from './GridRender';
import PropertiesPanel from './PropertiesPanel';
import Chip from '../data/Chip';
import { SideBar } from './components/SideBar';
import { getDockOpenState, RootState } from '../data/store';
import BottomDock from './components/BottomDock';

export interface MainRouteRendererProps {
    updateData: (data: Chip) => void;
}

const MainRouteRenderer: React.FC<MainRouteRendererProps> = ({ updateData }) => {
    const isDockOpen = useSelector((state: RootState) => getDockOpenState(state));
    const isDetailedViewOpen = useSelector((state: RootState) => state.detailedView.isOpen);
    return (
        <div
            className={`outer-wrapper ${isDockOpen ? 'dock-open' : ''} ${
                isDetailedViewOpen ? 'detailed-view-open' : ''
            }`}
        >
            <div className='main-wrapper'>
                <SideBar updateData={updateData} />
                <div className='main-container'>
                    <GridRender />
                    <PropertiesPanel />
                </div>
            </div>
            <BottomDock />
        </div>
    );
};

export default MainRouteRenderer;
