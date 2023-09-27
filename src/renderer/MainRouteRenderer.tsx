import React from 'react';
import './scss/MainRouteRenderer.scss';
import GridRender from './GridRender';
import PropertiesPanel from './PropertiesPanel';
import Chip from '../data/Chip';
import {SideBar} from './components/SideBar';

export interface MainRouteRendererProps {
    updateData: (data: Chip) => void;
}

const MainRouteRenderer: React.FC<MainRouteRendererProps> = ({updateData}) => {
    return (
        <div className="main-wrapper">
            <SideBar updateData={updateData} />
            <div className="main-container">
                <GridRender />
                <PropertiesPanel />
            </div>
        </div>
    );
};

export default MainRouteRenderer;
