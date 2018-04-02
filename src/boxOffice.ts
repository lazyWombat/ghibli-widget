import { Component, Selection, BoxOfficeService, Size, Context, GhibliService } from './commonTypes';
import { Film } from './models/film';
import Loading from './loading';
import Error from './error';
import Switch from './switch';
import VoronoiChart from './charts/voronoiChart';

class FilmWithRevenue extends Film {
    revenue: number;
}
export default class BoxOfficeGraph implements Component {
    ghibliService: GhibliService;
    boxOfficeService: BoxOfficeService;
    switch: Switch;
    error: Error;
    boxOffice: BoxOfficeService;
    chart: VoronoiChart<Film>;
    data: Film[];
    context: Context;
    selection: Selection;

    constructor() {
        const components = [];
        components.push(() => new Loading());
        components.push(this.createError);
        components.push(this.createVoronoiChart);
        this.switch = new Switch(components);
    }
    
    createError = () => {
        this.error = new Error();
        this.error.setRetry(this.load);
        return this.error;
    }
    
    createVoronoiChart = () => {
        this.chart = new VoronoiChart((film: FilmWithRevenue) => ({
            id: film.id,
            title: film.title,
            category: film.director,
            x: film.release_date,
            y: film.revenue,
            r: film.rt_score,
            tooltip: tooltip => this.updateTooltip(film, tooltip)
        }));
        return this.chart;
    }

    init = (selection: Selection, size: Size, context: Context) => {
        this.context = context;
        this.ghibliService = context.services.ghibliService;
        this.boxOfficeService = context.services.boxOfficeService;
        this.switch.init(selection, size, context);
        this.render = this.switch.render;
        this.resize = this.switch.resize;

        this.load();
    }

    render = () => { /* do nothing */ };
    resize = (size: Size) => { /* do nothing */ };

    renderLoading = () => { this.switch.select(0); this.switch.render(); };
    renderError = (error: string) => { this.switch.select(1); this.error.setData(error); this.switch.render(); };
    renderData = (films: FilmWithRevenue[]) => { 
        this.switch.select(2); 
        this.chart.updateData(films); 
        this.switch.render(); 
    }
    
    load = async () => {
        try {
            this.renderLoading();
            const films = await this.ghibliService.getFilms();

            const results = await Promise.all(films.map(film => this.boxOfficeService.grossRevenue(film.title)
                .then(revenue => ({ film, revenue }))));

            this.renderData(results.filter(result => result.revenue !== undefined)
                .map(result => ({
                    ...result.film,
                    revenue: result.revenue as number
                })));
        } catch (error) {
            this.renderError(error || 'Unknown error');
        }
    }

    updateTooltip = (film: FilmWithRevenue, tooltip: Selection) => {
        tooltip
            .style('font', '11px sans-serif')
            .style('width', '180px');
        tooltip.append('div')
            .style('margin-bottom', '4px')
            .style('color', this.context.theme.tooltipColor)
            .style('white-space', 'nowrap')
            .style('text-overflow', 'ellipsis')
            .style('overflow', 'hidden')
            .style('font-weight', 'bold')
            .text(film.title);
        this.addTooltipProperty(tooltip, 'Director', film.director, true);
        this.addTooltipProperty(tooltip, 'Producer', film.producer, false);
    }
    addTooltipProperty = (tooltip: Selection, label: string, value: string, isFirstProperty = false) => {
        const property = tooltip.append('div')
            .style('clear', 'right')
            .style('padding', '2px 0');
        if (!isFirstProperty) { property.style('border-top', `1px solid ${this.context.theme.neutralColor}`); }
        property.append('span')
            .style('color', this.context.theme.neutralColor)
            .text(label);
        property.append('span')
            .style('color', this.context.theme.tooltipColor)
            .style('font-weight', 'bold')
            .style('float', 'right')
            .style('white-space', 'nowrap')
            .style('text-overflow', 'ellipsis')
            .style('overflow', 'hidden')
            .text(value);
    }
}