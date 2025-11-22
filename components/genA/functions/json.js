import { isString } from "./system";

export function normalizeJson(source) {
    if (source.indexOf('"') == 0) {
        while (source.indexOf('"') == 0) {
            source = source.replaceAll('\\\\', "\\");
            source = source.substring(1, source.length - 1);
            if (source.length > 1 && source[0] == '\\') {
                source = source.substring(1, source.length - 1);
            }
        }

        source = source.replaceAll('\\"', '"');
        if (source.indexOf('"') == 0) {
            source = source.substring(1, source.length - 1);
        }
    }

    return source;
}

export const asJSON = (s) => {
    if (isString(s))
        s = normalizeJson(s);

    return isString(s) ? JSON.parse(s) : null;
}

export const asJSON2 = (s) => {
    if (isString(s))
        s = normalizeJson(s);

    return isString(s) ? JSON.parse(s) : s;
}

export const asJSONSafe = (s, defaultValue) => {
    try {
        if (isString(s))
            s = normalizeJson(s);

        return isString(s) ? JSON.parse(s) : s;
    } catch (e) {
        console.log("Error asJSONSafe:" + s);
        return defaultValue;
    }
}