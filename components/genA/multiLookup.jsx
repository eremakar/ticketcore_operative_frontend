import React, { useState } from "react";
import Details2 from "./details2";
import { findIndex } from "@/components/genA/functions/linq1";
import SheetTable from "./sheetTable";
import IconEye from '@/components/icon/icon-eye';

export default function MultiLookup({name, options, fullWidth = true, placeholder, formatItem, onChange, iconClassName, icon, value, renderTable, renderSelectionsTable, onSelectionsChange, ...props}) {
    const [detailsShow, setDetailsShow] = useState(false);
    const render = options?.table?.render;

    const format = (value) => formatItem ? formatItem(value) : value?.id;
    const icon2 = icon || IconEye;

    const [selected, setSelected] = useState(value || []);

    return (
        <>
            <button type="button" className="btn btn-sm" variant='primary' onClick={() => setDetailsShow(true)}><IconEye/>&nbsp;Выбрать</button>
            <Details2 show={detailsShow} setShow={setDetailsShow} {...options?.details} {...props}
                      size={null}
                      dialogClassName="modal-90w"
                      formatTitle={options?.details?.formatTitle || ((_) => `Выбор ${_ || ""}`)}
                      renderButtons={() => {
                          return <>
                              <button variant="primary" onClick={() => {
                                  setDetailsShow(false);
                                  onChange && onChange(selected);
                              }}>
                                  Выбрать
                              </button>
                          </>
                      }}
            >
                <div className="panel flex" style={{flexDirection: 'row'}}>
                    <div className="flex-column" style={{width: '50%'}}>
                        {renderTable ?
                            renderTable (options, setDetailsShow) :
                            <SheetTable renderFooter={() => {
                                return <>
                                    <p>Для выбора значения нажмите на строку в таблице</p>
                                </>
                            }}
                                    {...options?.table} actions={{
                                onSelect: (row) => {
                                    if (selected.find(_ => _.id == row.id))
                                        return;

                                    setSelected([row, ...selected]);
                                    onSelectionsChange && onSelectionsChange(row, selected, 'add');
                                }
                            }} {...props}
                            />
                        }
                    </div>
                    <div className="flex-column" style={{width: '50%'}}>
                        {renderSelectionsTable ?
                            renderSelectionsTable(options, setDetailsShow) :
                            <SheetTable data={selected} setData={setSelected} renderHeader={() => {
                                return <>
                                    <p>Выбранные значения</p>
                                </>
                            }} renderFooter={() => {
                                return <>
                                    <p>Для отмены выбранного значения нажмите на строку в таблице</p>
                                </>
                            }} isPager={false} {...options?.selectionsTable} actions={{
                                onSelect: (row) => {
                                    const index = findIndex(selected, _ => _.id == row.id);

                                    if (index < 0)
                                        return;

                                    const deleted = selected[index];
                                    selected.splice(index, 1);
                                    setSelected([...selected]);
                                    onSelectionsChange && onSelectionsChange(deleted, selected, 'remove');
                                }
                            }} {...props}
                            />
                        }
                    </div>
                </div>
            </Details2>
        </>
    );
}
