import useEnv from "../data/useEnv";
import { headers } from 'next/dist/client/components/headers'

export class S3Service {
    constructor(useEnv) {
        this.env = useEnv();
        this.url = this.env.s3.url;
    }

    upload = async (file, username, path, anonymous) => {
        let formData = new FormData()
        formData.append("file", file);
        const size = file.size;

        const headers = {
           // "Content-Type": "multipart/form-data"
        };

        if (!anonymous) {
            const token = localStorage.getItem('token');
            headers["Authorization"] = `Bearer ${token}`
        }

        const res = await fetch(`${this.url}/api/v1/file/upload?userName=${username}&path=agro/appraisers${path}&size=${size}`, {
            headers,
            method: 'post',
            body: formData
        });

        if (res.status != 200) {
            const error = new Error("Not authorized!");
            error.status = res.status;
            throw error;
        }

        const result = await res.json();
        return result;
    }

    downloadUrl = (bucketName, key, objectName) => {
        return `${this.url}/api/v1/file/download2?bucketName=${bucketName}&key=${key}&objectName=${objectName}`
    }

    delete = async (data, anonymous) => {
        if (!anonymous) {
            const token = localStorage.getItem('token')
            headers['Authorization'] = `Bearer ${token}`;
            headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(
            `${this.url}/api/v1/file/delete`,
            {
                headers,
                method: 'post',
                body: JSON.stringify(data)
            }
        )

        if (res.status != 200) {
            const error = new Error('Not authorized!')
            error.status = res.status
            throw error
        }

        const result = await res.json()
        return result
    }
}
