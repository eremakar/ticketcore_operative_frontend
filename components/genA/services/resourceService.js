import {useRouter} from "next/navigation";

export function ResourceService(env, resourceUrl, microserviceUrl = '', version = 1) {
    this.env = env;
    // Проверяем есть ли прямой URL микросервиса в env
    const hasMicroserviceUrl = microserviceUrl && this.env[microserviceUrl];
    // Если есть прямой URL - используем его, иначе api.url
    const url = hasMicroserviceUrl ? this.env[microserviceUrl].url : this.env.api.url;
    // Префикс нужен только если microserviceUrl указан, но прямого URL нет
    const microservicePrefix = (microserviceUrl && !hasMicroserviceUrl) ? '/' + microserviceUrl : '';
    const baseUrl = resourceUrl ? `${microservicePrefix}/api/v${version}/${resourceUrl}` : `/api/v${version}`;
    let router = useRouter();
    const routeChangeToAuth = () =>{
        let path = `/auth/cover-login`;
        router.push(path);
    }// localStorage.getItem('expires')

    return {
        url: baseUrl,
        fetch: async function (method, queryUrl, params, anonymous = false) {
            let headers = {
                "Content-Type": "application/json"
            }

            if (!anonymous) {
                const token = localStorage.getItem('token');
                const expiresToken = localStorage.getItem('expires');
                if(!expiresToken)
                    routeChangeToAuth();

                const expires = Date.parse(expiresToken);
                const nowDate = new Date();
                const now = Date.parse(nowDate);
                //получается токен - (нынешнее время - 10 мин)
                if(expires < (now - 600000)){
                    routeChangeToAuth();
                }
                // if(!token){
                //     //routeChangeToAuth();
                //     return false;
                // }
                headers["Authorization"] = `Bearer ${token}`
            }
            const response = await fetch(`${url}${baseUrl}${queryUrl}`, {
                headers: headers,
                method: method,
                body: params ? JSON.stringify(params) : null
            }).then();

            if (response.status != 200) {
                if (response.status == 403) {
                    alert('Ошибка: пользователь не авторизован');
                    return;
                } else if (response.status == 401 && !anonymous){
                    routeChangeToAuth();
                    return;
                } else {
                    // alert('Ошибка сервиса: ' + response.status + ', ' + (await response.text()));
                    return;
                }
                // const error = new Error("Not authorized!");
                // error.status = response.status;
                // throw error;
            }

            return await response.json();
        },
        search: async function (query = { paging: { skip: 0, take: 100 } }, anonymous = false) {
            return await this.fetch('post', '/search', query, anonymous);
        },
        get: async function (id, anonymous = false) {
            return await this.fetch('get', `/${id}`, null, anonymous);
        },
        create: async function (data, anonymous = false) {
            return await this.fetch('post', '', data, anonymous);
        },
        post: async function (endpoint, data = null, anonymous = false) {
            return await this.fetch('post', endpoint, data, anonymous);
        },
        edit: async function (data, anonymous = false) {
            return await this.fetch('put', '', data, anonymous);
        },
        patch: async function (id, data, anonymous = false) {
            return await this.fetch('PATCH', `/${id}`, data, anonymous);
        },
        delete: async function (id, anonymous = false) {
            return await this.fetch('delete', `/${id}`, {}, anonymous);
        },
        workflowRun: async function (id, previousState, nextState, data, path = '/run', anonymous = false) {
            return await this.fetch('post', `/workflow${path}`, { id: id, previousState, nextState, objectType: resourceUrl, data }, anonymous);
        },
        workflowRunComment: async function (id, previousState, comment, nextState, data, path = '/run', anonymous = false) {
            return await this.fetch('post', `/workflow${path}`, { id: id, previousState, comment, nextState, objectType: resourceUrl, data }, anonymous);
        }
    }
}
