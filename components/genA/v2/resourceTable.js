import { useContext, useEffect, useMemo, useState } from 'react'
import { DataSource } from '@/components/genA/v2/dataSource'
import DataTable2 from './dataTable'
import { dataTableEventTypeIds } from '@/components/genA/v2/dataTableEventTypeIds'
import ResourceDelete from '../resourceDelete'

const ResourceTable2 = ({
  context,
  useResource,
  resource: resourceProp,
  resourceName,
  data,
  setData,
  query,
  setQuery,
  columns,
  filters,
  sorts,
  groups,
  actionsHeadStyle,
  actions,
  anonymous = false,
  isDelete = true,
  onDeleteResourceSubmitted,
  onMap,
  onChange,
  useDnd,
  onGroupKeyChange,
  hierarchyId,
  enableHierarchy,
  hierarchyMember,
  hierarchyLevel,
  enableCellEditOnDoubleClick = false,
  fullHeight = false,
  renderExpandedRow,
  renderFooter,
  isFetch,
  fetch,
  ...props
}) => {
  const resource = typeof useResource === 'function' ? useResource() : (useResource || resourceProp)

  // const [internalData, setInternalData] = useState(data || [])
  // const appliedData = data ?? internalData
  // const appliedSetData = setData ?? setInternalData

  // useEffect(() => {
  //   setInternalData(data || []);
  // }, [data]);

  const [deleteShow, setDeleteShow] = useState(false)
  const [row, setRow] = useState(null);

  const actionsWithDelete = {
    ...actions,
    onDelete: isDelete ? async (wrappedRow) => {
      const row = wrappedRow.row;
      setRow(row)
      setDeleteShow(true)
    } : null
  }

  const dataSource = useMemo(() => {
    return new DataSource(async (query) => {
      return await resource.search(query);
    }, onMap, resource.url);
  }, [resource]);

  const defaultFetch = () => {
    setQuery(previous => ({ ...previous }));
  }

  const appliedFetch = fetch || defaultFetch;

  const appliedIsFetch = isFetch !== undefined ? isFetch : true;

  if (!query) {
    alert('Не задан параметр query');
    return <></>
  }

  return (
    <>
      <DataTable2
        context={context}
        data={data}
        setData={setData}
        query={query}
        setQuery={setQuery}
        dataSource={dataSource}
        columns={columns}
        filters={filters}
        sorts={sorts}
        groups={groups}
        actions={actionsWithDelete}
        actionsHeadStyle={actionsHeadStyle}
        useDnd={useDnd}
        onGroupKeyChange={onGroupKeyChange}
        collapsedGroups={props.collapsedGroups}
        onToggleGroup={props.onToggleGroup}
        hierarchyId={hierarchyId}
        enableHierarchy={enableHierarchy}
        hierarchyMember={hierarchyMember}
        hierarchyLevel={hierarchyLevel}
        enableCellEditOnDoubleClick={enableCellEditOnDoubleClick}
        fullHeight={fullHeight}
        renderExpandedRow={renderExpandedRow}
        renderFooter={renderFooter}
        isFetch={appliedIsFetch}
        fetch={appliedFetch}
        {...props}
        onChange={async (e) => {
          console.log(e);
          const wrappedRow = e.target;
          const row = wrappedRow.row;
          const type = e.type;
          const mode = e.data?.mode;

          if (onChange)
            await onChange(e);

          if (type != dataTableEventTypeIds.commitRow) {
            return;
          }

          if (row.id) {
            const response = await resource.edit(row);
          } else {
            if (mode == 'list') {
              return;
            }
            const id = await resource.create(row);
            row.id = id;
          }
        }}
      />
      <ResourceDelete
        show={deleteShow}
        setShow={setDeleteShow}
        useResource={useResource}
        resource={resource}
        resourceData={row}
        resourceName={resourceName}
        onResourceSubmitted={async () => {
          if (onDeleteResourceSubmitted)
            onDeleteResourceSubmitted();
          else
            appliedFetch();
        }}
      />
    </>
  )
}
export default ResourceTable2
