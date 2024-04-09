// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useEffect } from 'react';

const KEYBOARD_FOCUS_CLASS = 'tt-keyboard-focus';
const useKeyboardFocus = (): void => {
    useEffect(() => {
        const onMouseDown = (): void => {
            document.body.classList.remove(KEYBOARD_FOCUS_CLASS);
        };

        const onKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Tab') {
                document.body.classList.add(KEYBOARD_FOCUS_CLASS);
            }
        };

        document.body.addEventListener('mousedown', onMouseDown);
        document.body.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.removeEventListener('mousedown', onMouseDown);
            document.body.removeEventListener('keydown', onKeyDown);
        };
    }, []);
};

export default useKeyboardFocus;
