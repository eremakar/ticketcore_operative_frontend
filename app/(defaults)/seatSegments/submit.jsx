import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ResourceSubmit from "@/components/genA/resourceSubmit";
import HookForm from "@/components/genA/hookForm";
import Fields from "@/components/genA/fields";
import FormField from "@/components/genA/FormField";
import { useForm } from "react-hook-form";
import useResource from "@/hooks/useResource";

export default function SeatSegmentSubmit({show, setShow, resourceName, resource, resourceMode, resourceData, onResourceSubmitted, orientation, type: type2}) {
    const resolver = yupResolver(yup.object().shape({
        price: yup.string().required("Поле обязательное*"),
        seatId: yup.string().required("Поле обязательное*"),
        fromId: yup.string().required("Поле обязательное*"),
        toId: yup.string().required("Поле обязательное*"),
        trainId: yup.string().required("Поле обязательное*"),
        wagonId: yup.string().required("Поле обязательное*"),
        trainScheduleId: yup.string().required("Поле обязательное*"),
        ticketId: yup.string().required("Поле обязательное*"),
        seatReservationId: yup.string().required("Поле обязательное*"),
    }));
    const methods = useForm({
        resolver: resolver,
    });
    const {
        watch,
        setValue,
        trigger,
        formState: {errors},
        handleSubmit
    } = methods;

    const price = watch('price');
    const seatId = watch('seatId');
    const fromId = watch('fromId');
    const toId = watch('toId');
    const trainId = watch('trainId');
    const wagonId = watch('wagonId');
    const trainScheduleId = watch('trainScheduleId');
    const ticketId = watch('ticketId');
    const seatReservationId = watch('seatReservationId');
    const seatsResource = useResource('seats');
    const routeStationsResource = useResource('routeStations');
    const trainsResource = useResource('trains');
    const trainWagonsResource = useResource('trainWagons');
    const trainSchedulesResource = useResource('trainSchedules');
    const ticketsResource = useResource('tickets');
    return (
        <ResourceSubmit resource={resource} show={show} setShow={setShow} resourceName={resourceName} resourceMode={resourceMode} resourceData={resourceData} onResourceSubmitted={onResourceSubmitted} onSubmit={async handler => { handleSubmit(handler)(); }}>
            <HookForm methods={methods} data={resourceData}>
                <Fields>
                    <FormField type="number" name="price" label="Price" value={price} error={errors.price?.message} trigger={trigger} onChange={value => setValue('price', value)} isValidated={true} />
                    <FormField resource={seatsResource} type="resourceselect" name="seatId" mode="portal" label="Seat" value={seatId} error={errors.seatId?.message} trigger={trigger} onChange={value => setValue('seatId', value)} isValidated={true} />
                    <FormField resource={routeStationsResource} type="resourceselect" name="fromId" mode="portal" label="From" value={fromId} error={errors.fromId?.message} trigger={trigger} onChange={value => setValue('fromId', value)} isValidated={true} />
                    <FormField resource={routeStationsResource} type="resourceselect" name="toId" mode="portal" label="To" value={toId} error={errors.toId?.message} trigger={trigger} onChange={value => setValue('toId', value)} isValidated={true} />
                    <FormField resource={trainsResource} type="resourceselect" name="trainId" mode="portal" label="Train" value={trainId} error={errors.trainId?.message} trigger={trigger} onChange={value => setValue('trainId', value)} isValidated={true} />
                    <FormField resource={trainWagonsResource} type="resourceselect" name="wagonId" mode="portal" label="Wagon" value={wagonId} error={errors.wagonId?.message} trigger={trigger} onChange={value => setValue('wagonId', value)} isValidated={true} />
                    <FormField resource={trainSchedulesResource} type="resourceselect" name="trainScheduleId" mode="portal" label="TrainSchedule" value={trainScheduleId} error={errors.trainScheduleId?.message} trigger={trigger} onChange={value => setValue('trainScheduleId', value)} isValidated={true} />
                    <FormField resource={ticketsResource} type="resourceselect" name="ticketId" mode="portal" label="Ticket" value={ticketId} error={errors.ticketId?.message} trigger={trigger} onChange={value => setValue('ticketId', value)} isValidated={true} />
                </Fields>
            </HookForm>
        </ResourceSubmit>
    )
}
