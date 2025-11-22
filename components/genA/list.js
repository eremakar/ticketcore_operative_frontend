import { useState } from "react";
import { useEffect } from "react";
import IconPlus from '@/components/icon/icon-plus';

import Pagination from "./pagination";
import Filter from "./filter";
import Sort from "./sort";

const List = ({data, setData, query, setQuery, defaultQuery, onQuery, onMap, columns, filters, sorts, render, fetchingSpinner, isHeader = true, isPager = true, renderHeader, renderFooter, actions = {},
    renderAdvancedActions,
    filterMode='popup',
    sortMode = 'popup',
    initialShowFilter,
    ...props}) => {
    columns = columns?.filter(_ => !_.hidden);

    const { paging, filter, sort } = query || {
        paging: { skip: 0, take: 100, returnCount: false },
        filter: {},
        sort: {}
    };
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [defaultSort, setDefaultSort] = useState(defaultQuery?.sort || { 'id': { operator: 'desc' } });
    const [returnCount, setReturnCount] = useState(true);

    const [createShow, setCreateShow] = useState(false);

    const closeCreate = () => setCreateShow(false);

    const [showFilter, setShowFilter] = useState(initialShowFilter != null ? initialShowFilter : false);
    const [showSort, setShowSort] = useState(false);

    const compactButtonStyle = { paddingTop: '2px', paddingBottom: '2px' };

    const handleCreate = (data) => {
        alert(JSON.stringify(data));
        closeCreate();
    }

    useEffect(() => {
        fetch();
    }, [data, query]);

    const fetch = async () => {
        const pageQuery = {
            ...query,
            paging: { skip: paging.skip, take: paging.take, returnCount: returnCount }
        }
        setFetching(true);
        const response = onQuery ? await onQuery(data, pageQuery) : {
            result: data || [],
            total: data?.length || 0
        };

        if(!response){
            setFetching(false);
            return;
        }
        setFetching(false);
        if (response.total !== undefined && response.total !== null) {
            setTotal(response.total);
        } else if (response.count !== undefined && response.count !== null) {
            setTotal(response.count);
        }

        if (onMap)
            response.result = onMap(response.result);

        setPage(response.result);
        setReturnCount(false);
    }

    const { onCreate } = actions;

    const hasAdvancedActions = !!renderAdvancedActions;
    const hasCreateButton = !!onCreate;
    const hasFilterRow = filterMode != 'popup' && showFilter;
    const hasSortRow = sortMode != 'popup' && showSort;
    const hasHeaderContent = hasAdvancedActions || hasCreateButton || hasFilterRow || hasSortRow;

    return <>
        <div className="panel flex" style={{flexDirection: 'column'}}>
            {isHeader && hasHeaderContent && <div className="mb-5 flex items-center justify-between">
                {renderHeader ? renderHeader() : <table style={{width:'100%'}}>
                    <tbody>
                        {(hasAdvancedActions || hasCreateButton) && <tr key={1}>
                            {/* <td style={{width: '70px'}}>
                                <h3>Данные</h3>
                            </td> */}
                            <td>
                                {renderAdvancedActions && renderAdvancedActions()}
                            </td>
                            <td>
                                {hasCreateButton && <div className="btn-list" style={{float:'right'}}>
                                    <button type="button" class="btn btn-success" onClick={() => onCreate()}>
                                        <IconPlus />
                                        Создать
                                    </button>
                                </div>}
                            </td>
                        </tr>}
                        {hasFilterRow && <tr key={2}>
                            <td colSpan={3} style={{padding: '5px'}}>
                                <Filter query={query} setQuery={setQuery} schema={filters} mode={filterMode} part={2} show={showFilter} setShow={setShowFilter} onChanged={() => setReturnCount(true)} {...props} />
                            </td>
                        </tr>}
                        {hasSortRow && <tr key={3}>
                            <td colSpan={3} style={{padding: '5px'}}>
                                <Sort query={query} setQuery={setQuery} schema={{ sorts, columns, filters }} mode={sortMode} part={2} defaultSort={defaultSort} show={showSort} setShow={setShowSort} {...props} />
                            </td>
                        </tr> }
                    </tbody>
                </table>}
            </div>}

            {fetching && <div className="mb-5 flex items-center justify-between">
                <span class="animate-spin border-4 border-success border-l-transparent rounded-full w-12 h-12 inline-block align-middle m-auto mb-10"></span>
            </div>}
            {!fetching && (render && page && render(data, setData, page, setPage, columns, filters, sorts, { ...props, isFetch: true, fetch }))}
            {isPager && <div className="mb-5 flex items-center justify-between">
                <Pagination
                    count={total}
                    currentPage={Math.floor((paging?.skip || 0) / (paging?.take || 1)) + 1}
                    rowsPerPage={paging?.take || 100}
                    onPageChange={(page) => {
                        setQuery({
                            ...query,
                            paging: { ...paging, skip: (page - 1) * (paging?.take || 100) }
                        });
                    }}
                    onRowsPerPageChange={(take) => {
                        setQuery({
                            ...query,
                            paging: { ...paging, take, skip: 0 }
                        });
                        setReturnCount(true);
                    }}
                />
            </div>}
            {renderFooter && <div className="mb-5 flex items-center justify-between">
                {renderFooter && renderFooter()}
            </div>}
        </div>
    </>
}
export default List;
