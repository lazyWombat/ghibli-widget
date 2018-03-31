import { DataComponent, Selection, Theme, BoxOffice } from './commonTypes';
import { Film } from './models/film';
import VoronoiChart from './charts/voronoiChart';

export default class BoxOfficeGraph implements DataComponent<Film[]> {
    boxOffice: BoxOffice;
    chart: VoronoiChart<Film>;
    data: Film[];
    theme: Theme;
    selection: Selection;
    constructor(selection: Selection,
                width: number, height: number, data: Film[], theme: Theme,
                boxOffice: BoxOffice) {
        this.selection = selection;
        this.theme = theme;
        this.boxOffice = boxOffice;
        this.chart = new VoronoiChart(
            width, height, 
            {
                id: film => film.id,
                title: film => film.title,
                category: film => film.director,
                x: film => film.release_date,
                y: film => film.revenue,
                r: film => film.rt_score,
            }, 
            this.appendRevenue(data), theme);
    }

    appendRevenue = (data: Film[]) => (data.map(d => ({
            film: d,
            revenue: this.boxOffice.grossRevenue(d.title)
        })).filter(x => x.revenue !== undefined) as { film: Film, revenue: number }[])
        .map(d => ({
            ...d.film,
            revenue: d.revenue
        }))

    setData(data: Film[]): void {
        this.chart.updateData(this.appendRevenue(data));
        this.render();
    }
    resize(width: number, height: number): void {
        if (this.chart.width !== width || this.chart.height !== height) {
            this.chart.resize(width, height, this.selection);
        }
    }
    render(): void {
        this.selection.select('svg').remove();
        this.chart.render(this.selection);
    }
}