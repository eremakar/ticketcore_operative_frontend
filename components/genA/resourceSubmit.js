import { useState } from "react";
import Submit2 from "./submit2";

const ResourceSubmit = ({ useResource, resource, onSubmit, action, checkResponse, show, toggleClick, setShow, resourceName, size, resourceMode = 'create', resourceData, children,
    validationSchema,
    closeTitle = "Закрыть", submitTitle = "Сохранить", formatTitle, onResourceSubmitting, onResourceSubmitted, onMap, closeButtonClass, submitButtonClass, hideButtons, ...props }) => {
    resource = useResource ? useResource() : resource;

    let title = "";

    if (formatTitle)
        title = formatTitle(resourceName, resourceMode);
    else {
        switch (resourceMode) {
            case 'create':
                title = `Создать ${resourceName}`;
                break;
            case 'edit':
                title = `Редактировать ${resourceName}`;
                break;
        }
    }

    const [submitError, setSubmitError] = useState(null);

    const handleSubmit = async (data) => {
        setSubmitError(null);

        let response = null;

        if (onResourceSubmitting)
            await onResourceSubmitting(data);

        if (action)
            response = await action(data);
        else {
            switch (resourceMode) {
                case 'create':
                    response = await resource.create(data);
                    break;
                case 'edit':
                    response = await resource.edit(data);
                    break;
            }
        }

        const validateResponse = (response) => {
            const success = response != null;

            return success ? {
                success: true
            } : {
                success: false,
                message: 'Не удалось сохранить, попробуйте еще раз'
            }
        }

        const result = checkResponse ? (await checkResponse(response)) : validateResponse(response);

        if (!result.success) {
            setSubmitError(result.message);
            return;
        } else {
            await onResourceSubmitted(data);
        }

        setShow(false);
    }

    return <Submit2 show={show} setShow={setShow} size={size} title={title} data={resourceData} closeTitle={closeTitle} submitTitle={submitTitle}
        onSubmit={async () => onSubmit ? await onSubmit(handleSubmit) : await handleSubmit(resourceData)} submitError={submitError} onMap={onMap} 
        closeButtonClass={closeButtonClass} submitButtonClass={submitButtonClass} hideButtons={hideButtons} {...props}>
        {children}
    </Submit2>
}
export default ResourceSubmit;
