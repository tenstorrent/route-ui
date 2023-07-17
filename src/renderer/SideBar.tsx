import {useNavigate} from 'react-router-dom';
import {Button, Tooltip} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {useDispatch} from 'react-redux';
import {loadedFilename} from '../data/store';

export default function SideBar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const reloadApp = () => {
        dispatch(loadedFilename(''));
        navigate('/');
    };
    return (
        <div className="sidebar">
            <Tooltip content="Load new analyzer output .yaml file">
                <Button icon={IconNames.REFRESH} text="" onClick={reloadApp} />
            </Tooltip>
        </div>
    );
}
