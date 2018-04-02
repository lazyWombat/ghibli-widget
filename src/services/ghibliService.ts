import { GhibliService } from '../commonTypes';

export class GhibliServiceImpl implements GhibliService {
    apiUri: string;
    constructor(apiUri: string) {
        this.apiUri = apiUri;
    }
    getFilms = async () => {
        const response = await fetch(`${this.apiUri}/films`);
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('unexpected data format');
        }
        return data.map(d => ({
            ...d,
            rt_score: parseInt(d.rt_score.toString(), 10),
            release_date: parseInt(d.release_date.toString(), 10)
        }));
    }
}