import './MainRouteRenderer.scss';
import GridRender from './GridRender';
import PropertiesPanel from './PropertiesPanel';
import SideBar from './SideBar';

export default function MainRouteRenderer() {
    return (
        <div className="main-wrapper">
            <SideBar />
            <div className="main-container">
                <GridRender />
                <PropertiesPanel />
            </div>
        </div>
    );
}
