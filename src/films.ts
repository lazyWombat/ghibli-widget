import * as d3 from 'd3';
import { DataComponent } from './commonTypes';
import { Film } from './models/film';
import BubbleChart from './charts/multiCenterBubbleChart';
import Poster from './poster';

export default class FilmGraph implements DataComponent<Film[]> {
    poster: Poster;
    chart: BubbleChart<Film>;
    selection: d3.Selection<d3.BaseType, {}, null, undefined>;

    constructor(selection: d3.Selection<d3.BaseType, {}, null, undefined>,
                width: number, height: number, data: Film[]) {
        this.selection = selection;
        this.poster = new Poster();
        this.chart = new BubbleChart(
            width, 
            height, {
                id: film => film.id,
                group: film => film.producer,
                radius: film => film.rt_score,
                category: film => film.director,
                tooltip: film => tooltip => {
                    tooltip.selectAll('div').remove();
                    const image = tooltip.append('div');
                    this.poster.render(image, film);
                    const details = tooltip.append('div')
                        .style('margin', '5px')
                        .style('color', 'gray');
                    details
                        .append('h2')
                            .style('color', 'white')
                            .text(film.title)
                        .append('span')
                            .style('color', 'gray')
                            .text(` (${film.release_date})`);
                    details.append('hr');
                    details.append('span')
                        .text('Director: ')
                        .append('span')
                            .style('color', 'white')
                            .text(film.director);
                    details.append('br');
                    details.append('span')
                        .text('Producer: ')
                        .append('span')
                            .style('color', 'white')
                            .text(film.producer);
                    details.append('br');
                    details.append('br');
                    details.append('span').text('Rating');
                    details.append('br');
                    details.append('strong')
                        .style('color', 'white')
                        .style('font-size', '2em')
                        .text(`${film.rt_score}%`);
                }
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
