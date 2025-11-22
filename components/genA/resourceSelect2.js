'use client';

import { useState, useEffect } from "react";
import { Select2 } from "./select";
import { createQuery } from "./functions/query";

export const ResourceSelect2 = ({ useResource, resource, initialQuery, name, objectMemberName, valueMemberName = 'id', labelMemberName = 'name',
    fullWidth = true, label, placeholder, anonymous, orientation, ...props }) => {
    resource = useResource ? useResource() : resource;

    const [query, setQuery] = useState(initialQuery || createQuery());

    const [items, setItems] = useState([]);

    const fetch = async () => {
        const take = query?.paging?.take;

        if (take == 0) {
            return;
        }

        const response = await resource.search(query, anonymous);
        if(!response){
            return;
        }
        setItems(response.result);
    }

    useEffect(() => {
        if (!initialQuery)
            return;

        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        fetch();
    }, [query]);

    return <Select2 valueMemberName={valueMemberName} labelMemberName={labelMemberName} objectMemberName={objectMemberName}
        fullWidth={fullWidth} label={label} placeholder={placeholder} options={items}
        orientation={orientation}
        {...props} />
}
