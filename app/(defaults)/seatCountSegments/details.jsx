import ResourceDetails from "@/components/genA/resourceDetails";
import Fields from "@/components/genA/fields";
import FormField from "@/components/genA/FormField";

export default function SeatCountSegmentDetails({show, setShow, resourceName, resource, resourceData, orientation, type}) {
    return (
        <ResourceDetails resource={resource} show={show} setShow={setShow} resourceName={resourceName} resourceData={resourceData}>
            <FormField type="label" label="SeatCount" value={resourceData?.seatCount}/>
            <FormField type="label" label="FreeCount" value={resourceData?.freeCount}/>
            <FormField type="label" label="Price" value={resourceData?.price}/>
            <FormField type="label" label="Tickets" value={resourceData?.tickets ? JSON.stringify(resourceData?.tickets) : null}/>
            <FormField type="label" label="From" value={resourceData?.from?.name}/>
            <FormField type="label" label="To" value={resourceData?.to?.name}/>
            <FormField type="label" label="Train" value={resourceData?.train?.name}/>
            <FormField type="label" label="Wagon" value={resourceData?.wagon?.name}/>
            <FormField type="label" label="TrainSchedule" value={resourceData?.trainSchedule?.name}/>
        </ResourceDetails>
    )
}
