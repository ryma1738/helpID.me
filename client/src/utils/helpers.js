export const createPhoneNumber = (value, pastValue) => {
    if (value.length === 3) {
        if (pastValue.charAt(pastValue.length - 1) !== "-") {
            return value + "-";
        }
    } else if (value.length === 7) {
        if (pastValue.charAt(pastValue.length - 1) !== "-") {
            return value + "-";
        }
    }
    return value;
}