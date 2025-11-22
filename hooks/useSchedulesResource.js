import useResource from "./useResource";

export default function useSchedulesResource(resourceUrl, version = '1') {
    return useResource(resourceUrl, 'schedules', version);
}
