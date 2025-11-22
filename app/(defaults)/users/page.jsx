'use client';

import ResourceTable2 from "@/components/genA/resourceTable";
import useResource from "@/hooks/useResource";
import { useState } from "react";
import UserSubmit from "./submit";
import UserDetails from "./details";
import RoleLookup from "@/app/(defaults)/roles/lookup";
import { RoleNames } from "@/models/roleIds";

export default function Users() {
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

    const [newRow, setNewRow] = useState({
    });
    const [row, setRow] = useState(null);
    const [data, setData] = useState([]);
    const resourceActionPostfix = "users";

    const fetch = () => {
        setQuery({...query});
    }

    const resource = useResource('users');
    const rolesResource = useResource('roles');
    return (
        <>
            <ResourceTable2
                resource={resource}
                resourceName={resourceActionPostfix}
                query={query}
                setQuery={setQuery}
                hideDelete={false}
                isFetch={true}
                data={data}
                setData={setData}
                fetch={fetch}
                columns={[
                    { key: 'id', title: 'Ид', isSortable: true },
                    { key: 'userName', title: 'Имя пользователя', isSortable: true },
                    {
                        title: 'Роли',
                        key: 'roles',
                        render: (_) => _?.map(r => r?.roleId != null && r.roleId in RoleNames ? RoleNames[r.roleId] : r?.roleId ?? '').filter(Boolean).join(', '),
                    },
                    { key: 'protectFromBruteforceAttempts', title: 'Количество попыток входа', isSortable: true },
                    { key: 'positionName', title: 'Название должности', isSortable: true },
                    { key: 'isActive', title: 'Активен ли пользователь', isSortable: true, render: (value) => value ? 'Да' : 'Нет' },
                    { key: 'fullName', title: 'Ф.И.О', isSortable: true },
                ]}
                filters={[
                    {
                        title: 'Ид',
                        key: 'id',
                        type: 'number',
                    },
                    
                    {
                        title: 'Имя пользователя',
                        key: 'userName',
                        operator: 'like',
                    },
                    {
                        title: 'Количество попыток входа',
                        key: 'protectFromBruteforceAttempts',
                        type: 'number',
                    },
                    {
                        title: 'Название должности',
                        key: 'positionName',
                        operator: 'like',
                    },
                    {
                        title: 'Активен ли пользователь',
                        key: 'isActive',
                        type: 'boolean',
                    },
                    {
                        title: 'Ф.И.О',
                        key: 'fullName',
                        operator: 'like',
                    },
                ]}
                actions={{
                    onCreate: () => setCreateShow(true),
                    onEdit: (row) => {
                        setRow({ ...row });
                        setEditShow(true);
                    },
                    onDetails: (row) => {
                        setRow({ ...row });
                        setDetailsShow(true);
                    }
                }}
            />
            <UserSubmit resource={resource} show={createShow} setShow={setCreateShow} resourceName={resourceActionPostfix} resourceMode="create" resourceData={newRow} onResourceSubmitted={async () => fetch()} orientation="horizontal" type="expandable"/>
            <UserSubmit resource={resource} show={editShow} setShow={setEditShow} resourceName={resourceActionPostfix} resourceMode="edit" resourceData={row} onResourceSubmitted={async () => fetch()} orientation="horizontal" type="expandable"/>
            <UserDetails resource={resource} show={detailsShow} setShow={setDetailsShow} resourceName={resourceActionPostfix} resourceData={row} orientation="horizontal" type="expandable"/>
        </>
    )
}
