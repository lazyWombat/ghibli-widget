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
                    '<div>' +
                    '<img src="/poster.jpg" ' +
                    'style="max-height: 200px; width: auto;" /></div>' +
                    '<div style="margin: 5px;color: gray;">' +
                    `<h2><span style="color:white">${film.title}</span> (${film.release_date})</h2>` +
                    '<hr/>' +
                    `<span>Director: <strong style="color:white">${film.director}</strong></span>` +
                    `<br/><span>Producer: <strong style="color:white">${film.producer}</strong></span>` +
                    '<br/><br/><span>Rating</span>' +
                    `<br/><strong style="color:white;font-size:2em">${film.rt_score}%</strong>` +
                    '</div>'
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
