export function parseKeyValueString(
    input: string,
    onError: (pair: string) => void
): Record<string, string> {
    return input
        .split(',')
        .reduce((acc, pair) => {
            const [key, value] = pair.split('=');
            if (!key || value === undefined) {
                onError(pair);
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, string>);
}