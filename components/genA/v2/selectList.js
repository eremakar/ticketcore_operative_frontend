'use client';

import { Select2 } from '../select';
import IconX from '../../icon/icon-x';

export const SelectList = ({ value, options, renderValueItem, mapOption, mapKey, fetchOptions, labelMemberName = 'name', listOptions = {}, selectOptions = {}, orientation = 'horizontal', onChange }) => {
    // Minimal shim that uses existing Select2 for selecting items and calls onChange
    let items = options || [];

    if (fetchOptions) {
        items = fetchOptions();
      }

    const mapped = items.map((item) => {
        const key = (mapKey || ((_) => _.id))(item);
        const label = renderValueItem ? renderValueItem(item) : item[labelMemberName] || key;
        return { id: key, name: label, original: item };
    });

    const current = Array.isArray(value) ? value : (value ? [value] : []);
    const isVertical = orientation === 'vertical';

    const renderSelectedItems = () => {
        if (!value || value.length === 0) return null;

        const itemStyle = isVertical
            ? { marginBottom: '4px', padding: '2px 4px', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            : { marginRight: '5px', marginBottom: '2px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' };

        const containerStyle = isVertical
            ? { width: '100%', marginBottom: '8px' }
            : { width: '100%', display: 'flex', flexWrap: 'wrap', marginBottom: '4px' };

        return (
            <div style={containerStyle}>
                {value.map((item, index) => (
                    <div key={index} style={itemStyle}>
                        <span>{renderValueItem ? renderValueItem(item) : item.name}</span>
                        <span
                            onClick={() => {
                                const newValue = [...value];
                                newValue.splice(index, 1);
                                onChange(newValue, 'remove');
                            }}
                            style={{ marginLeft: '8px', cursor: 'pointer', color: '#dc3545' }}
                        >
                            <IconX className="w-4 h-4" />
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ width: '100%' }}>
            {renderSelectedItems()}
            <Select2
                options={mapped}
                isNullable={true}
                value={current[0]?.id || current[0]}
                orientation={isVertical ? 'vertical' : 'horizontal'}
                {...selectOptions}
                onChange={(val) => {
                    const selected = mapped.find((m) => m.id == val);
                    if (!selected) {
                        onChange && onChange(Array.isArray(value) ? [] : null);
                        return;
                    }
                    let result = mapOption ? mapOption(selected.original) : { id: selected.id };
                    if (Array.isArray(value)) result = result ? [result] : [];
                    onChange && onChange(result);
                }}
            />
        </div>
    );
};

export default SelectList;


