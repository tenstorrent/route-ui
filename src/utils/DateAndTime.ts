// eslint-disable-next-line import/prefer-default-export
export function getRelativeTimeString(date?: Date | number | string, lang = navigator.language) {
    if (!date) {
        return 'never';
    }

    const timeInMilliseconds = new Date(date).getTime();
    const deltaSeconds = Math.round((timeInMilliseconds - Date.now()) / 1000);

    const timeUnitCutoffs = new Map<Intl.RelativeTimeFormatUnit, number>([
        ['seconds', 60],
        ['minutes', 3600],
        ['hours', 86400],
        ['days', 604800],
        ['weeks', 2592000],
        ['months', 31536000],
        ['years', Infinity],
    ]);

    const [unit, divisor] = [...timeUnitCutoffs.entries()].find(([, cutoff]) => Math.abs(deltaSeconds) < cutoff) ?? [
        'minutes',
        60,
    ];

    if (!unit) {
        return 'a long time ago';
    }

    const formatter = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: 'long' });

    return formatter.format(Math.floor(deltaSeconds / divisor), unit);
}
