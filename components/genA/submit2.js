import { useEffect } from "react";
import { Fragment } from "react";
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import IconX from '@/components/icon/icon-x';

const Submit2 = ({show, setShow, title, data, submitDisabled, children, onSubmit, submitError, onMap, size = 'lg', dialogClassName="", closeTitle="Закрыть", submitTitle="Сохранить", closeButtonClass="btn btn-outline-danger", submitButtonClass="btn btn-outline-primary", hideButtons = false,  ...props}) => {
    useEffect(() => {
        if (!show || !data)
            return;
        data = onMap ? onMap(data) : data;
    }, [data, show]);

    const close = () => setShow(false);

    return <Transition appear show={show} as={Fragment}>
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
            <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
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
                        <DialogPanel as="div" className={`panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-${size} my-8 text-black dark:text-white-dark`}>
                            <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                <h5 className="font-bold text-lg">{title}</h5>
                                <button type="button" className="text-white-dark hover:text-dark" onClick={close}>
                                    <IconX />
                                </button>
                            </div>
                            <div className="p-5">
                                {children}
                                {submitError && <label style={{color: 'red'}}>{submitError}</label>}
                                {!hideButtons && (
                                    <div class="flex justify-end items-center mt-8">
                                        <button type="button" className={closeButtonClass} onClick={close}>
                                            {closeTitle}
                                        </button>
                                        <button type="button" className={`${submitButtonClass} ltr:ml-4 rtl:mr-4`} onClick={onSubmit} disabled={submitDisabled}>
                                            {submitTitle}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </Transition>
}
export default Submit2;
