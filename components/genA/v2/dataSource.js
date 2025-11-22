export class DataSource {
    constructor(fetchFunc, mapFunc, url) {
        this.fetchFunc = fetchFunc;
        this.mapFunc = mapFunc;
        this.url = url;
    }

    async fetch(query) {
        const response = await this.fetchFunc(query);
        if (!response) {
            return { total: 0, result: [] };
        }
        if (this.mapFunc && response.result) {
            response.result = this.mapFunc(response.result);
        }
        return response;
    }

    map(item) {
        return this.mapFunc ? this.mapFunc(item) : item;
    }
}

export default DataSource;


