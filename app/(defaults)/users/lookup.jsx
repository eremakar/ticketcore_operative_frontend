import ResourceLookup from "@/components/genA/resourceLookup";

export default function UserLookup({useResource, resource, name, label, options, ...props}) {
    resource = useResource ? useResource() : resource;

    return (
        <ResourceLookup
            resource = {resource}
            name={name}
            label={label}
            options={{
                ...options,
                table: {
                    ...options?.table,
                    columns: [
                        { key: 'id', title: 'Ид', isSortable: true },
                        { key: 'userName', title: 'Имя пользователя', isSortable: true },
                        { key: 'isActive', title: 'Активен ли пользователь', isSortable: true, render: (value) => value ? 'Да' : 'Нет' },
                        { key: 'protectFromBruteforceAttempts', title: 'Количество попыток входа', isSortable: true },
                        { key: 'fullName', title: 'Ф.И.О', isSortable: true },
                        { key: 'positionName', title: 'Название должности', isSortable: true },
                        { key: 'role', title: 'Role', isSortable: true, render: (value) => value?.name },
                        { key: 'roles', title: 'Roles', isSortable: true, render: (value) => value?.name }
                    ],
                    filters: [
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
                            title: 'Хеш пароля',
                            key: 'passwordHash',
                            operator: 'like',
                        },
                        {
                            title: 'Активен ли пользователь',
                            key: 'isActive',
                            type: 'boolean',
                        },
                        {
                            title: 'Количество попыток входа',
                            key: 'protectFromBruteforceAttempts',
                            type: 'number',
                        },
                        {
                            title: 'Ф.И.О',
                            key: 'fullName',
                            operator: 'like',
                        },
                        {
                            title: 'Название должности',
                            key: 'positionName',
                            operator: 'like',
                        },
                        {
                            title: 'RoleId',
                            key: 'roleId',
                            type: 'number',
                        }
                    ],
                    actions: {}
                }
            }}
            getRow={async (value) => {
                if (!value) {
                    return;
                }
                return await resource.get(value);
            }}
            labelMemberName="userName"
            {...props}
        />
    )
}
