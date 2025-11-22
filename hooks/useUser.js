import { AuthService } from "@/components/genA/services/authService";
import Cookies from "js-cookie";
import { RegistrationService } from "@/components/genA/services/registrationService";
import useEnv from "./useEnv";

export default function useUser() {
    const env = useEnv();
    const authService = new AuthService(env);
    const registrationService = new RegistrationService(env);

    const login = async (username, password) => {
        const result = await authService.login(username, password);

        if (result.token) {
            localStorage.setItem('token', result.token);
            const user = {
                userId: result.userId,
                userName: result.userName,
                isApproved: result.isApproved,
                appraiserRegistrationId: result.appraiserRegistrationId,
                roles: result.roles,
                filialId: result?.filialId
            };
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('expires', result.expires.toString());
            Cookies.set("user", JSON.stringify(user));
        } else if (result.wrongLoginOrPassword){
            return result;
        } else {
            const error = new Error("Not authorized!");
            error.status = 403;
            throw error;
        }

        return result;
    }

    const register = async (data) => {
        const result = await registrationService.register(data);
        return result;
    }

    const logout = () => {
        localStorage.setItem('token', null);
        localStorage.setItem('user', null);
        Cookies.remove("user");
    }

    return {
        register,
        login,
        logout
    }
}
