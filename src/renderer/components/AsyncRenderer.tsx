import { type FC, type ReactElement, useEffect, useState } from 'react';

export function asyncRenderer<T>(renderer: (() => Promise<T>) | (() => T), delay = 0) {
    return new Promise<T>((resolve, reject) => {
        try {
            setTimeout(async () => {
                resolve(await renderer());
            }, 0 + delay);
        } catch (err) {
            reject(err);
        }
    });
}

const AsyncComponent: FC<{
    renderer: () => Promise<any> | any;
    loadingContent: ReactElement | string;
    delay?: number;
    postRenderCallback?: () => any;
}> = ({ renderer, loadingContent: fallback, delay = 0, postRenderCallback }) => {
    const [content, setContent] = useState(fallback);

    // This effect is so we can have both micro and micro tasks queued.
    // The queued tasks are executed in sequence, which helps to free up the main thread.
    // While the task doesn't execute, we show a fallback content.
    useEffect(() => {
        (async () => {
            setContent(await asyncRenderer(renderer, delay));
            postRenderCallback?.();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderer]);

    return content;
};

export default AsyncComponent;
