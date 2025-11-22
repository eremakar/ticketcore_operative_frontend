import ResourceDetails from "@/components/genA/resourceDetails";
import Fields from "@/components/genA/fields";
import FormField from "@/components/genA/FormField";

export default function UserRoleDetails({show, setShow, resourceName, resource, resourceData, orientation, type}) {
    return (
        <ResourceDetails resource={resource} show={show} setShow={setShow} resourceName={resourceName} resourceData={resourceData}>
            <FormField type="label" label="User" value={resourceData?.user?.id}/>
            <FormField type="label" label="Role" value={resourceData?.role?.name}/>
        </ResourceDetails>
    )
}
