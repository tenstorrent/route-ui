// eslint-disable-next-line import/prefer-default-export
export const isDebug = () => {
    try {
        return process?.env.NODE_ENV === 'development' || process?.env.DEBUG_PROD === 'true';
    } catch {
        return false;
    }
};
