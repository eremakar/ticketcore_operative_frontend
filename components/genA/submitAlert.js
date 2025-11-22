import { useEffect, useState } from "react";

import Swal from "sweetalert2";

const SubmitAlert = ({show, setShow, title, actionTitle, submitTitle, data, onSubmit, submitError, isRevertable = false, ...props}) => {
    const close = () => setShow(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showAlert = () => {
        Swal.fire({
            icon: 'warning',
            title: `Вы уверены что хотите ${actionTitle}`,
            text: "Операция необратима",
            showCancelButton: true,
            confirmButtonText: submitTitle,
            padding: '2em',
        }).then(async (result) => {
            setShow(false);
            if (result.value) {
                setIsSubmitting(true);
                await onSubmit(data);
                setIsSubmitting(false);
            }
        });
    }

    useEffect(() => {
        if (!show)
            return;
        showAlert();
    }, [show]);

    return <></>
}
export default SubmitAlert;
