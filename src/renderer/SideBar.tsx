import {useNavigate} from 'react-router-dom';
import {Button, Tooltip} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';

export default function SideBar() {
    const navigate = useNavigate();
    return (
        <div className="sidebar">
            <Tooltip content="Load new analyzer output .yaml file">
                <Button icon={IconNames.REFRESH} text="" onClick={() => navigate('/')} />
            </Tooltip>
        </div>
    );
}
