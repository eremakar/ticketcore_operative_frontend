
import Pagination from '../pagination'
import { useState } from 'react'
import { useEffect } from 'react'
import Filter from '../filter'
import Sort from '../sort'
import List2Panel from './listPanel'
import Tippy from "@tippyjs/react";
import IconRefresh from '@/components/icon/icon-refresh';

const List2 = ({
  data,
  setData,
  query,
  setQuery,
  defaultQuery,
  columns,
  filters,
  sorts,
  groups,
  render,
  fetchingSpinner,
  disableFetchingSpinner,
  actions = {},
  filterMode = 'popup',
  sortMode = 'popup',
  filterProps,
  sortProps,
  labelDisplayedRows,
  initialShowFilter = null,
  isCard = true,
  isTopPanel = true,
  isBottomPanel = false,
  isPager = true,
  isBottomPager = true,
  isFetch = true,
  isFilter = true,
  isSort = true,
  isGroup = true,
  renderPanel,
  renderFooter,
  renderActions,
  renderAdvancedActions,
  renderCreateVariants,
  renderBodyStart,
  renderTableStart,
  dataSource,
  wrapData,
  onGroupKeyChange,
  ...props
}) => {
  const { paging, filter, sort } = query || {
    paging: { skip: 0, take: 100, returnCount: true },
    filter: {},
    sort: {}
  }
  const [total, setTotal] = useState(0)
  const [fetching, setFetching] = useState(false)
  const [defaultSort, setDefaultSort] = useState(defaultQuery?.sort || { id: { operator: 'desc' } })

  const [createShow, setCreateShow] = useState(false)

  const closeCreate = () => setCreateShow(false)

  const [showFilter, setShowFilter] = useState(initialShowFilter != null ? initialShowFilter : false)
  const [showSort, setShowSort] = useState(false);

  const [groupKey, setGroupKey] = useState(null);

  useEffect(() => {
    fetch()
  }, [query]);

  const ensureDataSource = () => {
    if (!dataSource) {
      //alert(`Не определен источник данных ${dataSource}`);
      return false;
    }

    if (!dataSource.fetch || !dataSource.map) {
      alert(`Источник данных имеет неверный формат`);
      return false;
    }

    return true;
  }

  const fetch = async () => {
    if (!ensureDataSource()) {
      return;
    }

    const dataSourceQuery = {
      ...query
    }

    console.log('list query:', query);
    if (paging) {
      console.log('query paging:', paging);
      console.log('paging: ', paging);
      dataSourceQuery.paging = { skip: paging.skip, take: paging.take, returnCount: paging.returnCount == undefined ? true : paging.returnCount }
    }
    setFetching(true);
    
    console.log(dataSource.url + ' before fetch dataSourceQuery:', dataSourceQuery);
    const response = await dataSource.fetch(dataSourceQuery);
    console.log(dataSource.url + ' after fetch dataSourceQuery:', dataSourceQuery);
    setFetching(false)
    if (response.total) {
      setTotal(response.total);
    }

    if (wrapData) {
      response.result = wrapData(response.result);
    }

    console.log('dataSourceQuery:', dataSourceQuery);
    console.log('dataSource url:', dataSource.url);
    console.log('table count:', response.total);
    console.log('table result:', response.result);
    setData(previous => response.result);
  }

  const { onCreate } = actions

  const onFilterOrSortChanged = () => {
    if (paging)
      setQuery(previous => ({ ...previous, paging: { ...previous.paging, returnCount: true } }));
  }

  const filterProps2 = { ...(filterProps || {}), onChanged: onFilterOrSortChanged };
  const sortProps2 = { ...(sortProps || {}), onChanged: onFilterOrSortChanged };
  
  return (
    isCard ? <div className="panel flex" style={{flexDirection: 'column', padding: '0'}}>
      {isTopPanel && (
        <div className="mb-5 flex items-center justify-between">
          {renderPanel ? (
            renderPanel()
          ) : (
            <List2Panel query={query} setQuery={setQuery} columns={columns}
              isFilter={isFilter} filters={filters} filterMode={filterMode} showFilter={showFilter} setShowFilter={setShowFilter} filterProps={filterProps2}
              isSort={isSort} sorts={sorts} sortMode={sortMode} defaultSort={defaultSort} showSort={showSort} setShowSort={setShowSort} sortProps={sortProps2}
              isGroup={isGroup} groups={groups} groupKey={groupKey} setGroupKey={setGroupKey} onGroupKeyChange={onGroupKeyChange}
              isFetch={isFetch} fetch={fetch}
              renderActions={renderActions}
              renderAdvancedActions={renderAdvancedActions}
              onCreate={onCreate}
              renderCreateVariants={renderCreateVariants}
              {...props} />
          )}
        </div>
      )}
      <div style={{paddingTop: '5px', paddingBottom: '5px', ...props.bodyStyle}}>
        {renderBodyStart && renderBodyStart()}
        {/* {isPager && (
          <Pagination
            labelRowsPerPage="Записей на странице"
            labelDisplayedRows={(p) => labelDisplayedRows ? labelDisplayedRows(p) : null}
            count={total}
            currentPage={paging.take > 0 ? (paging.skip / paging.take) + 1 : 1}
            rowsPerPage={paging.take}
            rowsPerPageOptions={[10, 25, 50, 100, 1000, 5000, 10000]}
            onPageChange={(page) => {
              const take = paging.take || 10;
              const newSkip = (page - 1) * take;
              setQuery(previous => ({ ...previous, paging: { ...previous.paging, skip: newSkip, returnCount: false } }));
            }}
            onRowsPerPageChange={(take) => {
              setQuery(previous => ({ ...previous, paging: { ...previous.paging, skip: 0, take, returnCount: false } }));
            }}
          />
        )} */}
        {renderTableStart && renderTableStart()}
        {fetching && !disableFetchingSpinner
          ? fetchingSpinner || (
                <div className="mb-5 flex items-center justify-between">
                    <span class="animate-spin border-4 border-success border-l-transparent rounded-full w-12 h-12 inline-block align-middle m-auto mb-10"></span>
                </div>
            )
          : ( render && render({
              data,
              setData,
              columns,
              filters,
              sorts,
              props: {
                ...props,
                isFetch,
                fetch,
                collapsedGroups: props.collapsedGroups,
                onToggleGroup: props.onToggleGroup
              }
            }))
          }
        {isPager && isBottomPager && (
          <Pagination
            count={total}
            currentPage={Math.floor((paging?.skip || 0) / (paging?.take || 1)) + 1}
            rowsPerPage={paging?.take || 10}
            onPageChange={(page) => {
                setQuery(previous => ({
                    ...previous,
                    paging: { ...previous.paging, skip: (page - 1) * (previous.paging?.take || 10) }
                }));
            }}
            onRowsPerPageChange={(take) => {
                setQuery(previous => ({
                    ...previous,
                    paging: { ...previous.paging, take, skip: 0 }
                }));
                setReturnCount(true);
            }}
          />
        )}
      </div>
      {isBottomPanel && (
        <div className="card-header">
          {renderPanel ? (
            renderPanel()
          ) : (
            <List2Panel query={query} setQuery={setQuery} columns={columns}
              isFilter={isFilter} filters={filters} filterMode={filterMode} showFilter={showFilter} setShowFilter={setShowFilter} filterProps={filterProps2}
              isSort={isSort} sorts={sorts} sortMode={sortMode} defaultSort={defaultSort} showSort={showSort} setShowSort={setShowSort} sortProps={sortProps2}
              isGroup={isGroup} groups={groups} groupKey={groupKey} setGroupKey={setGroupKey} onGroupKeyChange={onGroupKeyChange}
              isFetch={isFetch} fetch={fetch}
              renderAdvancedActions={renderAdvancedActions}
              onCreate={onCreate}
              renderCreateVariants={renderCreateVariants}
              {...props} />
          )}
        </div>
      )}
      {renderFooter && <div className="card-footer">{renderFooter && renderFooter()}</div>}
    </div> : <>
    {isTopPanel && (
          renderPanel ? (
            renderPanel()
          ) : (
            <List2Panel query={query} setQuery={setQuery} columns={columns}
              isFilter={isFilter} filters={filters} filterMode={filterMode} showFilter={showFilter} setShowFilter={setShowFilter} filterProps={filterProps2}
              isSort={isSort} sorts={sorts} sortMode={sortMode} defaultSort={defaultSort} showSort={showSort} setShowSort={setShowSort} sortProps={sortProps2}
              isGroup={isGroup} groups={groups} groupKey={groupKey} setGroupKey={setGroupKey} onGroupKeyChange={onGroupKeyChange}
              isFetch={isFetch} fetch={fetch}
              renderAdvancedActions={renderAdvancedActions}
              onCreate={onCreate}
              renderCreateVariants={renderCreateVariants}
              {...props} />
          )
      )}
        {renderBodyStart && renderBodyStart()}
        {isPager && (
          <Pagination
            labelRowsPerPage="Записей на странице"
            labelDisplayedRows={(p) => labelDisplayedRows ? labelDisplayedRows(p) : null}
            count={total}
            currentPage={paging.take > 0 ? (paging.skip / paging.take) + 1 : 1}
            rowsPerPage={paging.take}
            rowsPerPageOptions={[10, 25, 50, 100, 1000, 5000, 10000]}
            onPageChange={(page) => {
              const take = paging.take || 10;
              const newSkip = (page - 1) * take;
              setQuery(previous => ({ ...previous, paging: { ...previous.paging, skip: newSkip, returnCount: false } }));
            }}
            onRowsPerPageChange={(take) => {
              setQuery(previous => ({ ...previous, paging: { ...previous.paging, skip: 0, take, returnCount: false } }));
            }}
          />
        )}
        {renderTableStart && renderTableStart()}
        {fetching && !disableFetchingSpinner
          ? fetchingSpinner || (
              <div className="mb-5 flex items-center justify-between">
                <span className="animate-spin border-4 border-success border-l-transparent rounded-full w-12 h-12 inline-block align-middle m-auto mb-10"></span>
              </div>
            )
          : ( render && render({
              data,
              setData,
              columns,
              filters,
              sorts,
              props: {
                ...props,
                isFetch,
                fetch,
                collapsedGroups: props.collapsedGroups,
                onToggleGroup: props.onToggleGroup
              }
            }))
          }
        {isPager && isBottomPager && (
          <Pagination
            labelRowsPerPage="Записей на странице"
            labelDisplayedRows={(p) => labelDisplayedRows ? labelDisplayedRows(p) : null}
            count={total}
            currentPage={paging.take > 0 ? (paging.skip / paging.take) + 1 : 1}
            rowsPerPage={paging.take}
            rowsPerPageOptions={[10, 25, 50, 100, 1000, 5000, 10000]}
            onPageChange={(page) => {
              const take = paging.take || 10;
              const newSkip = (page - 1) * take;
              setQuery(previous => ({ ...previous, paging: { ...previous.paging, skip: newSkip, returnCount: false } }));
            }}
            onRowsPerPageChange={(take) => {
              setQuery(previous => ({ ...previous, paging: { ...previous.paging, skip: 0, take, returnCount: false } }));
            }}
          />
        )}
      {isBottomPanel && (
          renderPanel ? (
            renderPanel()
          ) : (
            <List2Panel query={query} setQuery={setQuery} columns={columns}
              isFilter={isFilter} filters={filters} filterMode={filterMode} showFilter={showFilter} setShowFilter={setShowFilter} filterProps={filterProps}
              isSort={isSort} sorts={sorts} sortMode={sortMode} defaultSort={defaultSort} showSort={showSort} setShowSort={setShowSort} sortProps={sortProps}
              isGroup={isGroup} groups={groups} groupKey={groupKey} setGroupKey={setGroupKey} onGroupKeyChange={onGroupKeyChange}
              isFetch={isFetch} fetch={fetch}
              renderAdvancedActions={renderAdvancedActions}
              onCreate={onCreate}
              renderCreateVariants={renderCreateVariants}
              {...props} />
          )
      )}
    </>
  )
}
export default List2
