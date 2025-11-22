import { useState } from "react";
import ResourceDelete from "./resourceDelete";
import SheetTable from "./sheetTable";

const ResourceTable = ({useResource = null, resource, onDelete, hideDelete = true, resourceName, query, setQuery, setPage, setCount, view, columns, filters, sorts, actionsHeadStyle, actions, actionsMap, filterActions, anonymous = false, onMap, isFetch, fetch, ...props}) => {
    resource = !resource ? useResource() : resource;

    const [deleteShow, setDeleteShow] = useState(false);
    const [row, setRow] = useState(null);

    const actionsWithDelete = { ...actions,
        onDelete: !hideDelete ? async (row) => {
            setRow(row);
            setDeleteShow(true);
        } : null
    };

    return <><SheetTable query={query} setQuery={setQuery} columns={columns} filters={filters} sorts={sorts} view={view} actions={actionsWithDelete} filterActions={filterActions} actionsMap={actionsMap} actionsHeadStyle={actionsHeadStyle} onMap={onMap} isFetch={isFetch} fetch={fetch} {...props}
        onQuery={async (data, pageQuery) => {
            const response = await resource.search(pageQuery, anonymous);

            setPage && setPage(response.result);

            if (response.count)
                setCount && setCount(response.count);

            return response;
        }}
     />
     <ResourceDelete show={deleteShow} onDelete={onDelete ? ()=> onDelete(row) : null} setShow={setDeleteShow} useResource={useResource} resource={resource} resourceData={row} resourceName={resourceName}
        onResourceSubmitted={async () => setQuery({...query})} />
     </>
}
export default ResourceTable;
