import React from 'react';
import './scss/MainRouteRenderer.scss';
import GridRender from './GridRender';
import PropertiesPanel from './PropertiesPanel';
import GridData from '../data/DataStructures';
import {SideBar} from './components/SideBar';

export interface MainRouteRendererProps {
    updateData: (data: GridData) => void;
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
