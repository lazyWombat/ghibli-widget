import * as d3 from 'd3';
import { DataComponent } from './commonTypes';

export default class ErrorMessage implements DataComponent<string> {
    width: number;
    height: number;
    selection: d3.Selection<d3.BaseType, {}, null, undefined>;
    error: string;
    retry: () => void | null | undefined;
    resizeActions: { (): void }[];
    selectors: {
        svg: () => d3.Selection<d3.BaseType, {}, null, undefined>;
        content: () => d3.Selection<d3.BaseType, {}, null, undefined>;
        retry: () => d3.Selection<d3.BaseType, {}, null, undefined>;
    };
    displayMoreDetails: boolean;

    constructor(selection: d3.Selection<d3.BaseType, {}, null, undefined>,
                width: number, height: number, data: string, retry: () => void | null | undefined) {
        this.selection = selection;
        this.width = width;
        this.height = height;
        this.error = data;
        this.retry = retry;
        this.resizeActions = [];
        this.selectors = {
            svg: () => this.selection.select('svg'),
            content: () => this.selectors.svg().select('g'),
            retry: () => this.selectors.svg().select('g:nth-child(2)')
        };
    }

    setData = (data: string) => {
        this.error = data;
        this.render();
    }

    showDetails = () => {
        this.displayMoreDetails = true;
        this.render();
    }

    resize = (width: number, height: number, force: boolean = false) => {
        if (this.width !== width || this.height !== height || force) {
            this.width = width;
            this.height = height;

            this.resizeActions.forEach(action => action());
        }
    }

    render = () => {
        this.resizeActions = [];
        this.selectors.svg().remove();
        const svg = this.selection
            .style('background', 'white')
            .style('border', '1px solid black')
        .append('svg');

        this.resizeActions.push(() => this.selectors.svg()
            .attr('width', this.width)
            .attr('height', this.height));

        const content = svg.append('g');

        this.resizeActions.push(() => this.selectors.content()
            .attr('transform', `translate(${this.width * 0.5}, ${this.height * 0.5})`));

        content.append('text')
            .attr('text-anchor', 'middle')
            .text('Widget failed to load');

        this.resizeActions.push(() => this.selectors.content()
            .style('font-size', `${this.width / 300}em`));

        if (this.error) {
            if (this.displayMoreDetails) {
                content.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '1.5em')
                    .attr('fill', 'red')
                    .text(this.error);
            } else {
                content.append('a')
                .on('click', this.showDetails)
                .style('cursor', 'pointer')
                .append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '1.5em')
                    .attr('fill', '#0078d7')
                    .text('More details');
            }
        }

        if (this.retry) {
            this.resizeActions.push(() => {
                const scale = Math.max(1, this.width / 400);
                const offset = 16 * scale + 5;
                this.selectors.retry()
                    .attr('transform', `translate(${this.width - offset}, 5) scale(${scale})`);
            });

            const link = svg.append('g').append('a')
                .style('cursor', 'pointer')
                .on('click', this.retry);
            link.append('rect')
                .attr('width', 16)
                .attr('height', 16)
                .style('fill-opacity', 0);
            link.append('path')
                    .attr('d', 'M14 1a1 1 0 0 0-1 1v1.146A6.948 6.948 0 0 0 1.227 6.307' +
                               'a1 1 0 1 0 1.94.484A4.983 4.983 0 0 1 8 3a4.919 4.919 0 0 1 3.967 2' +
                               'H10a1 1 0 0 0 0 2h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm.046 7.481' +
                               'a1 1 0 0 0-1.213.728A4.983 4.983 0 0 1 8 13a4.919 4.919 0 0 1-3.967-2' +
                               'H6a1 1 0 0 0 0-2H2a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-1.146' +
                               'a6.948 6.948 0 0 0 11.773-3.161 1 1 0 0 0-.727-1.212z');
        }

        this.resize(this.width, this.height, true);
    }
}
