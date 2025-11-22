import ResourceDetails from "@/components/genA/resourceDetails";
import Fields from "@/components/genA/fields";
import FormField from "@/components/genA/FormField";
import { formatDateTime } from "@/components/genA/functions/datetime";

export default function SeatRuleSegmentDetails({show, setShow, resourceName, resource, resourceData, orientation, type}) {
    return (
        <ResourceDetails resource={resource} show={show} setShow={setShow} resourceName={resourceName} resourceData={resourceData}>
            <FormField type="label" label="FromDate" value={formatDateTime(resourceData?.fromDate)}/>
            <FormField type="label" label="ToDate" value={formatDateTime(resourceData?.toDate)}/>
            <FormField type="label" label="1 - свободно, 2 - закрыто" value={resourceData?.state}/>
            <FormField type="label" label="Seat" value={resourceData?.seat?.name}/>
            <FormField type="label" label="From" value={resourceData?.from?.name}/>
            <FormField type="label" label="To" value={resourceData?.to?.name}/>
            <FormField type="label" label="Train" value={resourceData?.train?.name}/>
            <FormField type="label" label="Wagon" value={resourceData?.wagon?.name}/>
            <FormField type="label" label="TrainSchedule" value={resourceData?.trainSchedule?.name}/>
        </ResourceDetails>
    )
}
