import { extract, inject, remove } from "./path";

export const createQuery = (skip, take, filter, sort) => {
    let result = { paging: { skip: 0 }, filter: {}, sort: {} };
    if (skip != null)
        result.paging.skip = skip;
    if (take != null)
        result.paging.take = take;
    if (filter)
        result.filter = filter;
    if (sort)
        result.sort = sort;

    return result;
}

export const getFilter2 = (filter, key) => {
    const expression = extract("", key, filter);
    return expression;
}

export const getFilterValue2 = (filter, key, operandIndex, isAdvanced) => {
    if (isAdvanced) {
        if (filter.advancedFilter == null)
            filter.advancedFilter = {};
        const advancedFilter = filter.advancedFilter;        
        return advancedFilter[key];
    }

    const expression = getFilter2(filter, key);
    
    if (!expression)
        return "";
    
    switch (operandIndex) {
        case 2:
            return expression.operand2;
        default:
            return expression.operand1;
    }
}

export const setFilter2 = (filter, key, value, operandIndex, operator, isAdvanced) => {
    if (isAdvanced) {
        if (filter.advancedFilter == null)
            filter.advancedFilter = {};
        const advancedFilter = filter.advancedFilter;        
        advancedFilter[key] = value != "" ? value : null;
        return;
    }

    if (extract("", key, filter) == null)
        inject("", key, filter, null);

    if (value == null || value == undefined) {        
        return;
    }

    if (value == "") {
        remove("", key, filter);
        return;
    }

    const expression = getFilter2(filter, key) || {};
    expression.operator = operator;

    switch (operandIndex) {
        case 2:
            expression.operand2 = value;
            break;
        default:
            expression.operand1 = value;
            break;
    }

    inject("", key, filter, expression);
}

export const getSort = (sort, key) => {
    if (key.indexOf('.') >= 0)
        throw "Not supported";

    const expression = extract("", key, sort);
    return expression;
}

export const getSortValue = (sort, key) => {
    if (key.indexOf('.') >= 0)
        throw "Not supported";

    const expression = getSort(sort, key);
    
    if (!expression)
        return "";
    
    return expression.operator;
}

export const setSort2 = (sort, key, value) => {
    if (key.indexOf('.') >= 0)
        throw "Not supported";

    if (extract("", key, sort) == null)
        inject("", key, sort, null);

    const expression = getSort(sort, key) || {};
    expression.operator = value;

    inject("", key, sort, expression);
}

export const getDefaultSortExpression = (sort) => {
    if (!sort)
        return null;

    for (let key in sort) {
        const value = sort[key];
        if (value.operator)
            return { key: key, operator: value.operator, value: value };
    }

    return null;
}

export const clearSort = (sort) => {
    for (let key in sort) {
        delete sort[key];
    }
}

export const switchSort = (sort, key, direction = 'descending') => {
    const value = getSortValue(sort, key);

    let newValue = null;

    switch (direction) {
        case 'descending':
            switch (value) {
                case 'asc':
                    newValue = 'desc';
                    break;
                case 'desc':
                    newValue = 'asc';
                    break;
                default:
                    newValue = 'desc';
                    break;
            }
            break;
        case 'ascending':
            switch (value) {
                case 'asc':
                    newValue = 'desc';
                    break;
                case 'desc':
                    newValue = 'asc';
                    break;
                default:
                    newValue = 'asc';
                    break;
            }
            break;
    }

    setSort2(sort, key, newValue);
}