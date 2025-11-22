import useResource from "./useResource";

export default function useOperativeResource(resourceUrl, version = '1') {
    return useResource(resourceUrl, 'operative', version);
}
