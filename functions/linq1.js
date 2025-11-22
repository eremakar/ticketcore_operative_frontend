// TODO: use OOP here...
export const where = (collection, filterFunc) => {
  return collection.filter(filterFunc)
}

export const firstOrDefault = (collection, filterFunc, defaultFunc) => {
  defaultFunc = defaultFunc || (() => null)

  const result = where(collection, filterFunc)
  return result.length > 0 ? result[0] : defaultFunc()
}

export const findIndex = (collection, filterFunc) => {
  for (let i = 0; i < collection.length; i++) {
    const item = collection[i]

    if (filterFunc(item)) return i
  }

  return -1
}

export const distinct = (collection, equalsFunc) => {
  const result = []

  for (let i = 0; i < collection.length; i++) {
    const item = collection[i]
    if (result.filter((_) => equalsFunc(_, item)).length == 0) result.push(item)
  }

  return result
}

export const aggregate = (collection, initialValue, func) => {  
  let result = initialValue

  if (!collection)
    return result;

  for (let i = 0; i < collection.length; i++) {
    result = func(result, collection[i], initialValue)
  }

  return result
}

export const groupBy = (collection, keySelector, keyEqualsFunc, sortFunc) => {
  // collection.forEach((_) => {
  //   _.__key = keySelector(_)
  // })

  const keys = collection.map((_) => keySelector(_))
  const distinctKeys = distinct(keys, keyEqualsFunc)

  const result = []

  distinctKeys.forEach((key) => {
    const group = { key, values: [] }
    collection.forEach((item) => {
      const itemKey = keySelector(item);
      if (keyEqualsFunc(itemKey, key)) group.values.push(item)
    })
    if (sortFunc) {
      group.values = sortFunc(group.values);
    }
    group.first = null
    if (group.values.length > 0) {
      group.first = group.values[0]
    }
    result.push(group)
  })

  return result
}

const treeByRecurse = (collection, keySelector, parentKeySelector, childrenCreator, node, parentId, sortKeySelector) => {
  // collection.forEach((_) => {
  //   _.__key = keySelector(_)
  // })
  const children = childrenCreator(node);
  let childsCollection = collection.filter(_ => parentKeySelector(_) == parentId);

  if (sortKeySelector) {    
    childsCollection = childsCollection.sort((a, b) => sortKeySelector(a) - sortKeySelector(b));
  }

  childsCollection.forEach(_ => {
    children.push(_);
    const id = keySelector(_);
    _.parentNode = node;
    treeByRecurse(collection, keySelector, parentKeySelector, childrenCreator, _, id);
  });
}

export const treeBy = (collection, keySelector, parentKeySelector, sortKeySelector) => {
  // collection.forEach((_) => {
  //   _.__key = keySelector(_)
  // })

  const result = [];
  const rootNodes = collection.filter(_ => parentKeySelector(_) == null);

  rootNodes.forEach(_ => {
    result.push(_);
    const id = keySelector(_);
    treeByRecurse(collection, keySelector, parentKeySelector, _ => {
      const result = _.children = [];
      return result;
    }, _, id, sortKeySelector);
  });

  return result;
}

export const sum = (collection, selector) => {
  let result = 0
  collection.forEach((_) => (result += selector(_)))
  return result
}

export const max = (collection, selector) => {
  if (collection.length == 0) return null

  let result = selector(collection[0])
  collection.forEach((_) => {
    const item = selector(_)
    if (item > result) {
      result = item
    }
  })
  return result
}

export const min = (collection, selector) => {
  if (collection.length == 0) return null

  let result = selector(collection[0])
  collection.forEach((_) => {
    const item = selector(_)
    if (item < result) {
      result = item
    }
  })
  return result
}

export const select = (collection, selector) => {
  const result = []
  collection.forEach((_, index) => result.push(selector(_, index)))
  return result
}

export const skip = (collection, count) => {
  const result = []
  collection.forEach((_, index) => {
    if (index <= count - 1)
      return;
    result.push(_);
  })
  return result
}

export const all = (collection, selector) => {
  if (collection.length == 0) return true

  for (let i = 0; i < collection.length; i++) {
    const item = collection[i]
    if (!selector(item)) {
      return false
    }
  }

  return true
}

export const selectByKeys = (collection, keys, keyFunc) => {
  return collection.filter((_) => keys.filter((k) => k == keyFunc(_)).length > 0)
}

export const addRange = (collection, values) => {
  values.forEach((_) => collection.push(_))
}

export const sortBy = (collection, keySelector) => {
  return collection.sort((a, b) => keySelector(a) - keySelector(b));
}

export const sortByDescending = (collection, keySelector) => {
  return collection.sort((a, b) => keySelector(b) - keySelector(a));
}