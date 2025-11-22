import {userRoles} from "@/models/userRoles";

export default function useAuth() {
    const getToken = () => {
        const result = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return result;
    }

    const getUser = () => {
        const result = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        if (!result)
            return result;

        try {
            return JSON.parse(result);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    const getRoles = () => {
        const user = getUser();
        return user?.roles;
    }

    const isInRole = (role) => {
        const roles = getRoles();

        if (roles == null)
            return null;

        return roles.find(_ => _ == role);
    }

    const isAdministrator = () => {
        return isInRole(userRoles.superAdministrator) || isInRole(userRoles.administrator);
    }

    return {
        getToken,
        getUser,
        getRoles,
        isInRole,
        isAdministrator
    }
}
