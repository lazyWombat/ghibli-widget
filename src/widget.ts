import { capitalize } from 'lodash';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import { Component, WidgetType, WidgetTheme, Theme } from './commonTypes';
import { Film } from './models/film';
import LoadingIndicator from './loading';
import ErrorMessage from './error';
import FilmsGraph from './films';
import ThemeSelector from './theme';
import { select } from 'd3';
import BoxOfficeGraph from './boxOffice';
import BoxOfficeService from './services/boxOffice';

class WidgetState {
    isLoading?: boolean;
    data?: Film[];
    error?: string;
}

export default class Widget {
    theme: Theme;
    element: Element;
    server: string;
    resizeSensor: ResizeSensor;
    state: WidgetState;
    prevState: WidgetState;
    content: Component;    
    type: WidgetType;

    constructor(element: Element) {
        this.element = element;
        const server = element.getAttribute('data-server');
        this.theme = ThemeSelector(
            WidgetTheme[capitalize(element.getAttribute('data-theme') || 'light')] || WidgetTheme.Light);
        const dataType = element.getAttribute('data-type');
        this.type = this.getWidgetTheme(dataType);

        this.prevState = this.state = { isLoading: false };
        if (server) {
            this.server = server;
            if (this.type) {
                this.loadData();
            } else {
                this.onError(`Unknown widget type: ${dataType}`);
            }
            
        } else {
            this.onError('Missing data-server attribute');
        }
        this.resizeSensor = new ResizeSensor(this.element, this.onResize);
    }
    
    getWidgetTheme(s: string | null) {
        const type = (s || WidgetType.Films.toString()).split('-').map(capitalize).join('');
        return WidgetType[type] || WidgetType.Invalid;
    }
    
    loadData = () => {
        this.state = { isLoading: true };
        if (this.type !== WidgetType.Loading) {
            fetch(`${this.server}/films`)
                .then(this.onResponse)
                .catch(this.onError);
        }
        this.render();
    }

    onResponse = (response: Response) => response.json()
        .then(this.onDataReceived)
        .catch(this.onError)

    onDataReceived = (data: Film[]) => {        
        this.state = { 
            data: data.map(d => ({
                ...d,
                rt_score: parseInt(d.rt_score.toString(), 10),
                release_date: parseInt(d.release_date.toString(), 10)
            }))     
        };
        this.render();
    }

    onError = (reason: string) => {
        this.state = { error: reason };
        this.render();
    }

    onResize = () => this.content && this.content.resize(this.element.clientWidth, this.element.clientHeight);

    render() {
        if (this.prevState !== this.state) {
            const width = this.element.clientWidth;
            const height = this.element.clientHeight;
            const selection = select(this.element);

            if (this.state.isLoading && !this.prevState.isLoading) {
                this.content = new LoadingIndicator(selection, width, height, this.theme);
            } else if (this.state.error && !this.prevState.error) {
                this.content = new ErrorMessage(selection, width, height, this.state.error, this.loadData, this.theme);
            } else if (this.state.data && !this.prevState.data) {
                if (this.type === WidgetType.BoxOffice) {
                    this.content = new BoxOfficeGraph(selection, width, height, this.state.data, this.theme, 
                                                      new BoxOfficeService());
                } else {
                    this.content = new FilmsGraph(selection, width, height, this.state.data, this.theme);
                }
            } else if (!this.content) {
                this.content = new ErrorMessage(selection, width, height, 'unknown error', this.loadData, this.theme);
            }

            if (this.content) {
                this.content.render();
            }
        }
    }
}