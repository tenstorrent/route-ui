import React, { FC } from 'react';

interface HighlightedTextProps {
    text: string;
    filter: string;
}

const HighlightedText: FC<HighlightedTextProps> = ({ text, filter }) => {
    const index = text.toLowerCase().indexOf(filter.toLowerCase());

    if (index === -1) {
        return <span>{text}</span>;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + filter.length);
    const after = text.substring(index + filter.length);

    return <span dangerouslySetInnerHTML={{ __html: `${before}<mark>${match}</mark>${after}` }} />;
};

export default HighlightedText;
