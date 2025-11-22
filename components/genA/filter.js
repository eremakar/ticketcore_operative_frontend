import {useEffect, useState} from "react";
// import { PopoverButton } from "../form/popover";
import { getFilter2, getFilterValue2, setFilter2 } from "./functions/query";
import FormField from "./FormField";
import { Field } from "./field";
import Fields from "./fields";
import IconSearch from '@/components/icon/icon-search';
import Tippy from "@tippyjs/react";

const Filter = ({query, setQuery, schema, rows, mode, part, show, setShow, onChanged, ...props}) => {
    const [filter, setFilter] = useState(query?.filter || {});
    const [cols, setCols] = useState(3);
    const [detailsShow, setDetailsShow] = useState(false);
    const orientation = props.orientation || "horizontal";
    const vertical = orientation=="vertical";

    const [open, setOpen] = useState(false);

    useEffect(() => {
        updateCols();

        window.addEventListener("resize", updateCols);

        return () => {
            window.removeEventListener("resize", updateCols);
        };
    }, []);

    const get = (filterItem) => {
        return getFilterValue2(filter, filterItem.key, filterItem.operandIndex || 1, filterItem.advanced);
    }

    const set = (filterItem, value) => {
        if (value == null) {
            filter[filterItem.key] = null;
        } else {
            setFilter2(
                filter,
                filterItem.key,
                filterItem.convertToArray ? [value] : value,
                filterItem.operandIndex || 1,
                filterItem.operator || 'equals',
                filterItem.advanced
            );
        }
        setFilter({ ...filter });
        onChanged && onChanged();
    }

    const updateCols = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth < 1300) {
            setCols(1);
        } else if (screenWidth < 1700) {
            setCols(2);
        } else {
            setCols(3);
        }
    };

    const fetch = () => {
        setQuery({ ...query, filter: { ...filter } });
    }

    const clear = () => {
        setFilter({});
        setQuery({ ...query, filter: { } });
        onChanged && onChanged();
    }

    const fields = (schema || []).map((_, index) => {
        const fieldProps = {
            value: get(_),
            onChange: (value) => {
                set(_, value);
            },
            placeholder: vertical ? _.title : "",
            type: _.type || "text",
            orientation: orientation,
            options: _.options,
            ..._.props
        };
        return <FormField key={index} label={_.title} orientation={orientation}>
            {_.renderField ? _.renderField(fieldProps) : <Field {...fieldProps} />}
        </FormField>
        })

    switch (mode) {
        case 'popup':
            return <div className="flex">
                <Tippy visible={detailsShow} interactive={true} arrow={true} onClickOutside={() => setDetailsShow(false)} render={_ => detailsShow && <div {..._} style={{backgroundColor: 'white', padding: '15px'}}>
                        <Fields cols={3}>
                            {fields}
                        </Fields>
                        <div className="flex gap-2" style={{paddingTop: '20px'}}>
                            <button type="button" className="btn btn-neo" onClick={() => fetch()}>Поиск</button>
                            <button type="button" className="btn btn-outline-primary" onClick={() => clear()}>Очистить фильтр</button>
                        </div>
                    </div>} placement="right">
                    <button type="button" className="btn btn-neo btn-icon" onClick={() => setDetailsShow(!detailsShow)}>
                        <IconSearch />
                    </button>
                </Tippy>
            </div>
        default:
            switch (part) {
                case 1:
                    return <Tippy content="Фильтр"><button type="button" className="btn btn-sm btn-neo btn-icon" onClick={() => setShow(!show)}>
                        <IconSearch />
                    </button></Tippy>
                case 2:
                    return show && <>
                        <Fields cols={3}>
                            {fields}
                        </Fields>
                        <div className="flex gap-2" style={{paddingTop: '20px'}}>
                            <button type="button" className="btn btn-neo" onClick={() => fetch()}>Поиск</button>
                            <button type="button" className="btn btn-outline-primary" onClick={() => clear()}>Очистить фильтр</button>
                        </div>
                    </>
            }
    }


}
export default Filter;
