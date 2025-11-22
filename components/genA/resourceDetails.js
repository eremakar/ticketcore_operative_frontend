import Details2 from "./details2";
import Swal from "sweetalert2";

const ResourceDetails = ({useResource, resource, show, setShow, resourceName, resourceData, size, children, closeTitle="Закрыть", formatTitle,
    workflowActions, workflowRoles, workflowStateMember = 'stateId', onResourceWorkflowWillSubmit, onResourceWorkflowSubmitted,  ...props}) => {
    resource = !resource ? useResource() : resource;

    const handleWorkflowAction = async (id, stateId, nextState, data) => {
        if (onResourceWorkflowWillSubmit) {
            if (!await onResourceWorkflowWillSubmit(data))
                return;
        }

        const response = await resource.workflowRun(id, stateId, nextState, data);
        if (response.success) {
            onResourceWorkflowSubmitted && await onResourceWorkflowSubmitted(id, nextState, data);
            setShow(false);
            await Swal.fire({
                icon: "success",
                title: "Успешно",
                text: "Рабочий процесс выполнен"
            });
        } else {
            setShow(false);
            await Swal.fire({
                icon: "error",
                title: "Ошибка",
                text: `Ошибка: ${JSON.stringify(response)}`
            });
        }
    }

    return <Details2 data={resourceData} show={show} setShow={setShow} size={size} resourceName={resourceName} closeTitle={closeTitle} formatTitle={formatTitle}
        renderButtons={() => {
            if (!workflowActions && !workflowRoles)
                return <></>;
            return <>
                {
                    workflowActions.filter(_ => !_.hidden).map((_, index) =>
                        <button key={index} variant={_.variant} onClick={async () => {
                            const id = resourceData?.id;
                            const state = resourceData[workflowStateMember];
                            await handleWorkflowAction(id, state, _.nextState, _.data);
                        }}>
                            {_.title}
                        </button>
                    )
                }
            </>
        }}
        {...props}>
            {children}
        </Details2>
}
export default ResourceDetails;
