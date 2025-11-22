import useResource from "./useResource";

export default function useTarificationsResource(resourceUrl, version = '1') {
    return useResource(resourceUrl, 'tarifications', version);
}
