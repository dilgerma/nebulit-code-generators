
export function assertNotEmpty<T>(value: T): NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error("Expected non-empty value");
    }
    return value!!;
}