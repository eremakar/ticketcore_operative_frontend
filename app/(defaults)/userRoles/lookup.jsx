import ResourceLookup from "@/components/genA/resourceLookup";

export default function UserRoleLookup({useResource, resource, name, label, options, ...props}) {
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
                        { key: 'user', title: 'User', isSortable: true, render: (value) => value?.userName },
                        { key: 'role', title: 'Role', isSortable: true, render: (value) => value?.name }
                    ],
                    filters: [
                        {
                            title: 'Ид',
                            key: 'id',
                            type: 'number',
                        },
                        {
                            title: 'UserId',
                            key: 'userId',
                            type: 'number',
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
            {...props}
        />
    )
}
