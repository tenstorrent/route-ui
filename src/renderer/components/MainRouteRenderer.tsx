import React from 'react';
import '../scss/MainRouteRenderer.scss';
import GridRender from '../GridRender';
import PropertiesPanel from '../PropertiesPanel';
import SideBar from '../SideBar';

const MainRouteRenderer: React.FC = () => {
    return (
        <div className="main-wrapper">
            <SideBar />
            <div className="main-container">
                <GridRender />
                <PropertiesPanel />
            </div>
        </div>
    );
};

export default MainRouteRenderer;
