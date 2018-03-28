import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import { Component } from './commonTypes';
import { Film } from './models/film';
import LoadingIndicator from './loading';
import ErrorMessage from './error';
import FilmsGraph from './films';
import { select } from 'd3';

class WidgetState {
    isLoading?: boolean;
    data?: Film[];
    error?: string;
}

export default class Widget {
    element: Element;
    server: string;
    resizeSensor: ResizeSensor;
    state: WidgetState;
    prevState: WidgetState;
    content: Component;    

    constructor(element: Element) {
        this.element = element;
        const server = element.getAttribute('data-server');
        this.prevState = this.state = { isLoading: false };
        if (server) {
            this.server = server;
            // this.loadData();
            this.onError('Test error');
        } else {
            this.onError('Missing data-server attribute');
        }
        this.resizeSensor = new ResizeSensor(this.element, this.onResize);
    }

    loadData = () => {
        this.state = { isLoading: true };
        fetch(`${this.server}/films`)
            .then(this.onResponse)
            .catch(this.onError);
        this.render();
    }

    onResponse = (response: Response) => response.json()
        .then(this.onDataReceived)
        .catch(this.onError)

    onDataReceived = (data: Film[]) => {
        this.state = { data };
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
                this.content = new LoadingIndicator(selection, width, height);
            } else if (this.state.error && !this.prevState.error) {
                this.content = new ErrorMessage(selection, width, height, this.state.error, this.loadData);
            } else if (this.state.data && !this.prevState.data) {
                this.content = new FilmsGraph(selection, width, height, this.state.data);
            } else if (!this.content) {
                this.content = new ErrorMessage(selection, width, height, 'unknown error', this.loadData);
            }

            if (this.content) {
                this.content.render();
            }
        }
    }
}