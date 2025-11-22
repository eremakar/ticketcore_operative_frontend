// TODO: use OOP here...
export const where = (collection, filterFunc) => {    
    return collection.filter(filterFunc);    
}

export const firstOrDefault = (collection, filterFunc, defaultFunc) => {
    defaultFunc = defaultFunc || (() => null);

    const result = where(collection, filterFunc);
    return result.length > 0 ? result[0] : defaultFunc();
}

export const findIndex = (collection, filterFunc) => {
    for (let i = 0; i < collection.length; i++) {
        const item = collection[i];

        if (filterFunc(item))
            return i;
    }

    return -1;
}

export const distinct = (collection, equalsFunc) => {
    const result = [];

    for (let i = 0; i < collection.length; i++) {
        const item = collection[i];
        if (result.filter(_ => equalsFunc(_, item)).length == 0)
            result.push(item);
    }

    return result;
}

export const aggregate = (collection, initialValue, func) => {
    let result = initialValue;

    for (let i = 0; i < collection.length; i++) {
        result = func(result, collection[i], initialValue);
    }

    return result;
}

export const groupBy = (collection, keySelector, keyEqualsFunc) => {
    collection.forEach(_ => {
        _.__key = keySelector(_);
    });

    const keys = collection.map(_ => _.__key);
    const distinctKeys = distinct(keys, keyEqualsFunc);
    
    const result = [];

    distinctKeys.forEach(key => {
        const group = { key, values: [] };
        collection.forEach(item => {
            if (keyEqualsFunc(item.__key, key))
                group.values.push(item);
        });
        group.first = null;
        if (group.values.length > 0) {
            group.first = group.values[0];
        }
        result.push(group);
    });

    return result;
}

export const sum = (collection, selector) => {
    let result = 0;
    collection.forEach(_ => result += selector(_));
    return result;
}

export const max = (collection, selector) => {
    if (collection.length == 0)
        return null;

    let result = selector(collection[0]);
    collection.forEach(_ => {
        const item = selector(_);
        if (item > result) {
            result = item;
        }
    });
    return result;
}

export const min = (collection, selector) => {
    if (collection.length == 0)
        return null;

    let result = selector(collection[0]);
    collection.forEach(_ => {
        const item = selector(_);
        if (item < result) {
            result = item;
        }
    });
    return result;
}

export const select = (collection, selector) => {
    const result = [];
    collection.forEach(_ => result.push(selector(_)));
    return result;
}

export const all = (collection, selector) => {
    if (collection.length == 0)
        return true;

    for (let i = 0; i < collection.length; i++) {
        const item = collection[i];
        if (!selector(item)) {
            return false;
        }
    }

    return true;
}

export const selectByKeys = (collection, keys, keyFunc) => {
    return collection.filter(_ => keys.filter(k => k == keyFunc(_)).length > 0);
}

export const addRange = (collection, values) => {
    values.forEach(_ => collection.push(_));
}

export const transpose = (collection, select, axis, result) => {
    if (collection.length < axis.length)
        return;

    for (let i = 0; i < collection.length; i++) {
        const item = collection[i];
        const index = axis[i];
        const data = select ? select(item) : item;

        for (let key in data) {
            const value = data[key];
            if (!value)
                continue;
            setTransposedProperty(result, key, index, value);
        }
    }
}

export const setTransposedProperty = (data, propertyName, index, value) => {
    const row = data.find(_ => _.name == propertyName);

    if (!row)
        return;

    row[index] = value;
}