'use client';

import Select from 'react-select';

export const Select2 = ({ options, placeholder, orientation, value, onChange, isNullable, isNullLabel = 'Не указано', mode, multiple, fullWidth = true, ...props }) => {
    const vertical = orientation=="vertical";

    const valueMemberName = props.valueMemberName || "id";
    const labelMemberName = props.labelMemberName || "name";
    const labelMemberFunc = props.labelMemberFunc;
    const codeMemberName = props.codeMemberName || "code";

    let mappedOptions = options.map(_ => {
        const label = labelMemberFunc ? labelMemberFunc(_) : _[labelMemberName];
        return { value: _[valueMemberName], label: label, code: _[codeMemberName] }
    });

    if (isNullable && !multiple)
        mappedOptions = [{ value: '', label: isNullLabel, code: '' }].concat(mappedOptions);

    const find = (value) => {
        return mappedOptions.find(_ => _.value == value);
    }

    const findMultiple = (values) => {
        if (!values || !Array.isArray(values)) return [];
        return values.map(v => find(v)).filter(Boolean);
    }

    const item = multiple 
        ? findMultiple(value)
        : (value ? find(value) : (isNullable ? mappedOptions[0] : null));

    const buildMappedObj = (itemValue, itemLabel, itemCode) => {
        const obj = {};
        obj[valueMemberName] = itemValue;
        obj[labelMemberName] = itemLabel;
        obj[codeMemberName] = itemCode;
        return obj;
    };

    return <Select
        classNamePrefix="Select-sm"
        className={fullWidth ? "w-full" : ""}
        placeholder={vertical ? placeholder : ""}
        menuPortalTarget={null}
        menuPosition={mode == 'portal' ? 'fixed' : null}
        menuPlacement={mode == 'portal' ? 'auto' : 'bottom'}
        value={item}
        options={mappedOptions}
        isMulti={multiple}
        onChange={(e) => {
            if (multiple) {
                // Handle multiple selection
                const items = e || [];
                const values = items.map(item => item.value);
                onChange && onChange(values);
            } else {
                // Handle single selection
                const item = e;
                
                // Find the original object from options
                const originalObj = options.find(_ => _[valueMemberName] == item.value);
                
                // Create mapped object with standard field names
                const mappedObj = buildMappedObj(item.value, item.label, item.code);
                
                // Call onChange with all three parameters: (newValue, originalObj, mappedObj)
                onChange && onChange(item.value, originalObj, mappedObj);

                if (props.objectMemberName && props.setValue) {
                    props.setValue(props.objectMemberName, mappedObj);
                }
            }
        }}
        {...props}
    />
}
