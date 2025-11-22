export class RegistrationService {
    constructor(env) {
        this.env = env;
        this.url = this.env.api.url;
    }

    register = async (data) => {
        const res = await fetch(`${this.url}/api/v1/register`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify(data)
        });

        if (res.status != 200) {
            const error = new Error("Not registered!");
            error.status = res.status;
            throw error;
        }

        const result = await res.json();
        return result;
    }

    changePassword = async (data) => {
        const res = await fetch(`${this.url}/api/v1/changePassword`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify(data)
        });

        if (res.status != 200) {
            const error = new Error("Not registered!");
            error.status = res.status;
            throw error;
        }

        const result = await res.json();
        return result;
    }
}
