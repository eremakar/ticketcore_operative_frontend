export class AuthService {
    constructor(env) {
        this.env = env;
        this.url = this.env.api.url;
    }

    login = async (username, password) => {
        const res = await fetch(`${this.url}/api/v1/authenticate`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify({ username, password })
        });

        if (res.status != 200) {
            if(res.status == 401){
                return {
                    wrongLoginOrPassword: 'Неправильный логин или пароль'
                }
            }
            const error = new Error("Not authorized!");
            error.status = res.status;
            throw error;
        }

        const result = await res.json();

        if(!result.token){
            return {
                wrongLoginOrPassword: 'Неправильный логин или пароль'
            }
        }

        return result;
    }
}
