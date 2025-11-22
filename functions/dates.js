export function fixTimeZone(date, offset) {
    if (!date) return null;

    const validDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(validDate.getTime())) {
        return null;
    }

    const offsetNumber = Number(offset);
    if (!Number.isFinite(offsetNumber)) {
        return new Date(validDate.getTime());
    }

    const targetOffsetMinutes = offsetNumber * 60;
    const utcTime = validDate.getTime() + (validDate.getTimezoneOffset() * 60000);
    const targetTime = utcTime + targetOffsetMinutes * 60000;
    return new Date(targetTime);
}

