import { Component, Context, Size, Selection, GhibliService } from './commonTypes';
import { Film } from './models/film';
import BubbleChart from './charts/multiCenterBubbleChart';
import Poster from './poster';
import Loading from './loading';
import Error from './error';
import Switch from './switch';

export default class FilmComponent implements Component {
    switch: Switch;
    error: Error;
    service: GhibliService;
    context: Context;
    poster: Poster;
    chart: BubbleChart<Film>;
    selection: Selection;

    constructor() {
        const components = [];
        components.push(() => new Loading());
        components.push(this.createError);
        components.push(this.createBubbleChart);
        this.switch = new Switch(components);
        this.poster = new Poster();
    }

    init = (selection: Selection, size: Size, context: Context) => {
        this.context = context;
        this.service = context.services.ghibliService;
        this.switch.init(selection, size, context);

        this.resize = this.switch.resize;
        this.render = this.switch.render;
        
        this.load();
    }

    resize(size: Size) { /* do nothing */ }
    render() { /* do nothing */ }

    createError = () => {
        this.error = new Error();
        this.error.setRetry(this.load);
        return this.error;
    }

    createBubbleChart = () => {
        this.chart = new BubbleChart((film: Film) => ({
            id: film.id,
            group: film.producer,
            radius: film.rt_score,
            category: film.director,
            tooltip: tooltip => {
                tooltip.selectAll('div').remove();
                const image = tooltip.append('div');
                this.poster.render(image, film);
                const details = tooltip.append('div')
                    .style('margin', '5px')
                    .style('color', this.context.theme.neutralColor);
                details
                    .append('h2')
                        .style('color', this.context.theme.tooltipColor)
                        .text(film.title)
                    .append('span')
                        .style('color', this.context.theme.neutralColor)
                        .text(` (${film.release_date})`);
                details.append('hr');
                details.append('span')
                    .text('Director: ')
                    .append('span')
                        .style('color', this.context.theme.tooltipColor)
                        .text(film.director);
                details.append('br');
                details.append('span')
                    .text('Producer: ')
                    .append('span')
                        .style('color', this.context.theme.tooltipColor)
                        .text(film.producer);
                details.append('br');
                details.append('br');
                details.append('span').text('Rating');
                details.append('br');
                details.append('strong')
                    .style('color', this.context.theme.tooltipColor)
                    .style('font-size', '2em')
                    .text(`${film.rt_score}%`);
            }
        }));
        return this.chart;
    }

    renderLoading = () => { this.switch.select(0); this.switch.render(); };
    renderError = (error: string) => { this.switch.select(1); this.error.setData(error); this.switch.render(); };
    renderData = (films: Film[]) => { this.switch.select(2); this.chart.updateData(films); this.switch.render(); };

    load = async () => {
        try {
            this.renderLoading();
            this.renderData(await this.service.getFilms());
        } catch (error) {
            this.renderError(error || 'Unknown error');
        }
    }
}
