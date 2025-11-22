'use client';

import ResourceTable from "@/components/genA/resourceTable";
import useResource from "@/hooks/useResource";
import { useState } from "react";
import RoleLookup from "@/app/(defaults)/roles/lookup";

export default function UserRoles() {
    const [query, setQuery] = useState({
        paging: { skip: 0, take: 100 },
        filter: {},
        sort: {
            id: {
                operator: 'desc'
            }
        }
    });

    const [createShow, setCreateShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [detailsShow, setDetailsShow] = useState(false);

    const [row, setRow] = useState(null);
    const resourceActionPostfix = "userRoles";

    const fetch = () => {
        setQuery({...query});
    }

    const resource = useResource('userRoles');
    const rolesResource = useResource('roles');
    return (
        <>
            <ResourceTable
                resource={resource}
                resourceName={resourceActionPostfix}
                query={query}
                setQuery={setQuery}
                filterMode="default"
                sortMode="default"
                hideDelete={false}
                columns={[
                    { key: 'id', title: 'Ид', isSortable: true },
                    { key: 'user', title: 'User', isSortable: true, render: (value) => value?.userName },
                    { key: 'role', title: 'Role', isSortable: true, render: (value) => value?.name },
                ]}
                filters={[
                    {
                        title: 'Ид',
                        key: 'id',
                        type: 'number',
                    },
                    {
                        title: 'UserId',
                        key: 'userId',
                    },
                    {
                        title: 'RoleId',
                        key: 'roleId',
                        renderField: (fieldProps) => <RoleLookup resource={rolesResource} {...fieldProps} />,
                    },
                ]}
            />
        </>
    )
}
