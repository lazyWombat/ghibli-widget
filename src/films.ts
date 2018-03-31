import { DataComponent, Theme, Selection } from './commonTypes';
import { Film } from './models/film';
import BubbleChart from './charts/multiCenterBubbleChart';
import Poster from './poster';

export default class FilmGraph implements DataComponent<Film[]> {
    theme: Theme;
    poster: Poster;
    chart: BubbleChart<Film>;
    selection: Selection;

    constructor(selection: Selection, width: number, height: number, 
                data: Film[], theme: Theme) {
        this.selection = selection;
        this.poster = new Poster();
        this.theme = theme;
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
                        .style('color', theme.neutralColor);
                    details
                        .append('h2')
                            .style('color', this.theme.tooltipColor)
                            .text(film.title)
                        .append('span')
                            .style('color', theme.neutralColor)
                            .text(` (${film.release_date})`);
                    details.append('hr');
                    details.append('span')
                        .text('Director: ')
                        .append('span')
                            .style('color', this.theme.tooltipColor)
                            .text(film.director);
                    details.append('br');
                    details.append('span')
                        .text('Producer: ')
                        .append('span')
                            .style('color', this.theme.tooltipColor)
                            .text(film.producer);
                    details.append('br');
                    details.append('br');
                    details.append('span').text('Rating');
                    details.append('br');
                    details.append('strong')
                        .style('color', this.theme.tooltipColor)
                        .style('font-size', '2em')
                        .text(`${film.rt_score}%`);
                }
            }, 
            data, 
            theme);
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
