import { ResourceService } from "@/components/genA/services/resourceService";
import Cookies from "js-cookie";
import useEnv from "./useEnv";

export default function useResource(resourceUrl, microserviceUrl, version = '1') {
    const env = useEnv();
    const resourceService = new ResourceService(env, resourceUrl, microserviceUrl, version);

    return {
        ...resourceService
    }
}
