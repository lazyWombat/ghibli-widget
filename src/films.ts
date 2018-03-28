import * as d3 from 'd3';
import { DataComponent } from './commonTypes';
import { Film } from './models/film';
import BubbleChart from './charts/multiCenterBubbleChart';

export default class FilmGraph implements DataComponent<Film[]> {
    chart: BubbleChart<Film>;
    selection: d3.Selection<d3.BaseType, {}, null, undefined>;

    constructor(selection: d3.Selection<d3.BaseType, {}, null, undefined>,
                width: number, height: number, data: Film[]) {
        this.selection = selection;
        this.chart = new BubbleChart(
            width, 
            height, {
                id: film => film.id,
                group: film => film.producer,
                radius: film => film.rt_score,
                category: film => film.director,
                tooltip: film => (
                    `<span>Title: <strong>${film.title}</strong></span>` +
                    '<br/>' +
                    `<span>Year: <strong>${film.release_date}</strong></span>` + 
                    '<br/>' +
                    `<span>Director: <strong>${film.director}</strong></span>`
                )
            }, 
            data);
    }

    setData(data: Film[]) {
        this.chart.updateData(data);
        this.render();
    }
    
    resize(width: number, height: number) {
        if (this.chart.width !== width || this.chart.height !== height) {
            this.chart.resize(width, height, this.selection);
        }
    }

    render() {
        this.selection.select('svg').remove();
        this.chart.render(this.selection);
    }
}
