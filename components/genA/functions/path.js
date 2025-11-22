export const join = (path1, path2) => {
    return (path1 || "") + (path2 || "");
}

export const extract = (path1, path2, data) => {
    const path = join(path1, path2);

    const tokens = path.split('.');
    let result = data;

    if (tokens.length == 1)
        return result[path];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        result = result[token];
        if (!result)
            return result;
    }

    return result;
}

export const inject = (path1, path2, data, value) => {
    const path = join(path1, path2);

    const tokens = path.split('.');
    let parent = data;

    if (tokens.length == 1) {
        parent[path] = value;
        return;
    }

    for (let i = 0; i < tokens.length - 1; i++) {
        const token = tokens[i];

        const previous = parent;
        parent = parent[token];
        if (!parent) {
            const obj = {};
            previous[token] = obj;
            parent = obj;
        }
    }

    parent[tokens[tokens.length - 1]] = value;
}

export const remove = (path1, path2, data) => {
    const path = join(path1, path2);

    const tokens = path.split('.');
    
    if (tokens.length == 0)
        return;

    delete data[tokens[0]];
}