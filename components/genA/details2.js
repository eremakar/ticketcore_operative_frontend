'use client';
import { useState, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import IconX from '@/components/icon/icon-x';

const Details2 = ({show, setShow, resourceName, title, data, children, formatTitle, size = 'lg', closeTitle="Закрыть", closeButton = true, renderButtons, zIndex, usePortal = false, ...props}) => {
    const close = () => setShow(false);

    let modalTitle = title;

    if (!title) {
        if (formatTitle)
            modalTitle = formatTitle(resourceName);
        else
            modalTitle = `Просмотр ${resourceName || ""}`;
    }

    const dialogZIndex = zIndex || 999;

    const content = show && <Transition appear show={show} as={Fragment}>
        <Dialog as="div" open={show} onClose={close}>
            <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0" />
            </TransitionChild>
            <div className="fixed inset-0 bg-[black]/60 overflow-y-auto" style={{ zIndex: dialogZIndex }}>
                <div className="flex items-center justify-center min-h-screen px-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel as="div" className={`panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-${size} my-8 text-black dark:text-white-dark flex flex-col`} style={{ maxHeight: '80vh' }}>
                            <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3 flex-shrink-0">
                                <h5 className="font-bold text-lg">{modalTitle}</h5>
                                <button type="button" className="text-white-dark hover:text-dark" onClick={close}>
                                    <IconX />
                                </button>
                            </div>
                            <div className="p-5 flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                                <div className="flex-1 overflow-y-auto" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                    {children}
                                </div>
                                <div className="flex justify-end items-center mt-8 flex-shrink-0">
                                    {renderButtons && renderButtons()}
                                    {closeButton && <button type="button" className="btn btn-outline-danger" onClick={close}>
                                        {closeTitle}
                                    </button>}
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </Transition>;

    if (usePortal && typeof window !== 'undefined') {
        return createPortal(content, document.body);
    }

    return content;
}
export default Details2;
