import ResourceDetails from "@/components/genA/resourceDetails";
import Fields from "@/components/genA/fields";
import FormField from "@/components/genA/FormField";
import { FormSection } from "@/components/genA/formSection";

export default function UserDetails({show, setShow, resourceName, resource, resourceData, orientation, type}) {
    return (
        <ResourceDetails resource={resource} show={show} setShow={setShow} resourceName={resourceName} resourceData={resourceData}>
            <FormSection type="expandable" title="Учетные данные">
                <Fields cols="2">
                    <FormField type="label" label="Имя пользователя" value={resourceData?.userName}/>
                </Fields>
            </FormSection>
            <FormSection type="expandable" title="Служебные">
                <Fields cols="2">
                    <FormField type="label" label="Количество попыток входа" value={resourceData?.protectFromBruteforceAttempts}/>
                    <FormField type="label" label="Активен ли пользователь" value={resourceData?.isActive ? "Да" : "Нет"}/>
                </Fields>
            </FormSection>
            <FormSection type="expandable" title="Контактные данные">
                <Fields cols="2">
                    <FormField type="label" label="Название должности" value={resourceData?.positionName}/>
                    <FormField type="label" label="Ф.И.О" value={resourceData?.fullName}/>
                </Fields>
            </FormSection>
        </ResourceDetails>
    )
}
