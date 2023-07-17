import React, {FC} from 'react';

interface ProgressBarProps {
    percent: number;
    color?: string;
}
const ProgressBar: FC<ProgressBarProps> = ({percent, color}) => {
    let styles: {} = {width: `${percent}%`};
    if (color) {
        styles = {...styles, backgroundColor: color};
    }
    return (
        <span className="progress-bar">
            <span className="track" style={styles} />
        </span>
    );
};

ProgressBar.defaultProps = {
    color: undefined,
};
export default ProgressBar;
