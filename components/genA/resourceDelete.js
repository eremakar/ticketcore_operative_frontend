import Swal from "sweetalert2";
import SubmitAlert from "./submitAlert";

const ResourceDelete = ({show, setShow, onDelete, useResource, resource, resourceData, resourceName, onResourceSubmitted, isRevertable = false, ...props}) => {
    resource = typeof useResource === 'function' ? useResource() : (useResource || resource);

    const handleDelete = async () => {
        const response = await resource.delete(resourceData?.id);

        if (!response?.succeded) {
            const errorMessage = 'Не удалось удалить, попробуйте еще раз: ' + response.errorMessage;
            await Swal.fire({
                icon: "error",
                title: "Ошибка",
                text: errorMessage
            });
        } else {
            await onResourceSubmitted();
        }

        setShow(false);
    }

    return <>
        <SubmitAlert show={show} setShow={setShow} title={`Удаление ${resourceName} ${resourceData?.id}`} actionTitle={`удалить ${resourceName}`} submitTitle="Удалить"
            isRevertable={isRevertable} onSubmit={async () => {
                if (onDelete) {
                    onDelete();
                    setShow(false);
                } else handleDelete();
            }} {...props} />
    </>
}
export default ResourceDelete;
