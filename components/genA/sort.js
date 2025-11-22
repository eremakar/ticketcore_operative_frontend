import { clearSort, getDefaultSortExpression, getSortValue, setSort2 } from "./functions/query";
import { useState } from "react";
// import { Button, Stack } from "react-bootstrap";
// import FormField from "../hookForm/FormField";
// import { Field } from "../form/field";
// import { PopoverButton } from "../form/popover";
// import Fields from "../form/fields";
import { useEffect } from "react";
import FormField from "./FormField";
import { Field } from "./field";
import Fields from "./fields";
import IconStar from '@/components/icon/icon-star';
import Tippy from "@tippyjs/react";

const Sort = ({query, setQuery, schema, rows, mode, part, show, setShow, defaultSort, ...props}) => {
    const defaultSortExpression = getDefaultSortExpression({ ...defaultSort });

    const [sort, setSort] = useState(query?.sort || { ...defaultSort });
    const [key, setKey] = useState(defaultSortExpression?.key || "Id");
    const [operator, setOperator] = useState(defaultSortExpression?.operator || "asc");
    const [detailsShow, setDetailsShow] = useState(false);
    const orientation = props.orientation || "horizontal";
    const vertical = orientation=="vertical";

    useEffect(() => {
        if (!query?.sort)
            return;

        const sortExpression = getDefaultSortExpression(query?.sort);
        if (!sortExpression)
            return;

        setKey(sortExpression.key);
        setOperator(sortExpression.operator);
    }, [query?.sort]);

    const [open, setOpen] = useState(false);

    const get = (sortItem) => {
        return getSortValue(sort, sortItem.key);
    }

    const set = (sortItem, value) => {
        setSort2(sort, sortItem.key, value);
        setSort({ ...sort });
    }

    const fetch = () => {
        if (!key) {
            alert('Нужно выбрать поле для сортировки');
            return;
        }

        if (!operator) {
            alert('Нужно выбрать направление сортировки');
            return;
        }

        clearSort(sort);
        set({ key: key }, operator);

        setQuery({ ...query, sort: { ...sort } });
    }

    const clear = () => {
        setKey(defaultSortExpression.key);
        setOperator(defaultSortExpression.operator);
        setSort(defaultSort);

        setQuery({ ...query, sort: defaultSort });
    }

    const schemaValue = (schema || { sorts: [], columns: [] });
    const sortItems = (schemaValue.filters ? schemaValue.filters.filter(_ => _.isSortable) : (schemaValue.sorts || []));
    const keyOptions = sortItems.map(_ => {
        return {
            id: _.key,
            name: _.title
        }
    });
    const operatorOptions = [
        { id: 'asc', name: 'По возрастанию' },
        { id: 'desc', name: 'По убыванию' }
    ];

    const fields = <Fields cols={2}>
        <FormField label={"Поле сортировки"} orientation={orientation} renderField={() => {
            return <Field
                value={key}
                onChange={(value) => {
                    setKey(value);
                }}
                placeholder={vertical ? "Поле сортировки" : ""} type="select" orientation={orientation} options={keyOptions} />
        }} />
        <FormField label={"Направление"} orientation={orientation} renderField={() => {
            return <Field
                value={operator}
                onChange={(value) => {
                    setOperator(value);
                }}
                placeholder={vertical ? "Направление" : ""} type="select" orientation={orientation} options={operatorOptions} />
        }} />
    </Fields>;

    switch (mode) {
        case 'popup':
            return <div className="flex">
                <Tippy visible={detailsShow} interactive={true} arrow={true} onClickOutside={() => setDetailsShow(false)} render={_ => detailsShow && <div {..._} style={{backgroundColor: 'white', padding: '15px'}}>
                        <div style={{minWidth: '400px'}}>
                            {fields}
                            <div className="flex gap-2">
                                <button type="button" class="btn btn-primary" onClick={() => fetch()}>Сортировать</button>
                                <button type="button" class="btn btn-outline-primary" onClick={() => clear()}>Сбросить по умолчанию</button>
                            </div>
                        </div>
                    </div>} placement="right">
                    <button type="button" class="btn btn-sm btn-primary" onClick={() => setDetailsShow(!detailsShow)}>
                        <IconStar />
                    </button>
                </Tippy>
            </div>
        default:
            switch (part) {
                case 1:
                    return <Tippy content="Сортировка"><button type="button" class="btn btn-sm btn-primary" onClick={() => setShow(!show)}>
                        <IconStar />
                    </button></Tippy>
                case 2:
                    return show && <>
                        {fields}
                        <div className="flex gap-2" style={{marginTop: '15px'}}>
                            <button type="button" class="btn btn-primary" onClick={() => fetch()}>Сортировать</button>
                            <button type="button" class="btn btn-outline-primary" onClick={() => clear()}>Сбросить по умолчанию</button>
                        </div>
                    </>
            }
    }
}
export default Sort;
