import './MainRouteRenderer.scss';
import GridRender from './GridRender';
import PropertiesPanel from './PropertiesPanel';

export default function MainRouteRenderer() {
    return (
        <div className="main-container">
            <GridRender />
            <PropertiesPanel />
        </div>
    );
}
