import * as d3 from 'd3';
import { DataComponent, Context, Selection, Size } from './commonTypes';

type RetryFn = () => void;

export default class ErrorMessage implements DataComponent<string> {
    context: Context;
    size: Size;
    selection: Selection;
    error: string;
    retry: () => void | null | undefined;
    resizeActions: { (): void }[];
    displayMoreDetails: boolean;
    svg: d3.Selection<d3.BaseType, {}, null, undefined>;
    contentGroup: d3.Selection<d3.BaseType, {}, null, undefined>;
    retryGroup: d3.Selection<d3.BaseType, {}, null, undefined>;

    constructor() {
        this.displayMoreDetails = false;
    }

    setData = (data: string) => this.error = data;

    setRetry = (retry: RetryFn) => this.retry = retry;

    showDetails = () => {
        this.displayMoreDetails = true;
        this.render();
    }

    init(selection: Selection, size: Size, context: Context) {
        this.selection = selection;
        this.size = size;
        this.context = context;
        this.render = this.renderImpl;
        this.resize = this.resizeImpl;
    }

    resize(size: Size) { /* do nothing */ }
    render() { /* do nothing */ }

    resizeImpl = (size: Size) => {
        this.size = size;
        if (this.resizeActions) {            
            this.resizeActions.forEach(action => action());
        } else {
            this.render();
        }
    }

    renderImpl = () => {
        this.resizeActions = [];
        this.selection.select('svg').remove();
        this.svg = this.selection
            .style('background', this.context.theme.background)
            .style('border', `1px solid ${this.context.theme.color}`)
        .append('svg');

        this.resizeActions.push(() => this.selection.select('svg')
            .attr('width', this.size.width)
            .attr('height', this.size.height));

        this.contentGroup = this.svg.append('g');

        this.resizeActions.push(() => this.contentGroup
            .attr('transform', `translate(${this.size.width * 0.5}, ${this.size.height * 0.5})`));

        this.contentGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', this.context.theme.color)
            .text('Widget failed to load');

        this.resizeActions.push(() => this.contentGroup
            .style('font-size', `${Math.min(this.size.width / 300, this.size.height / 30)}em`));

        if (this.error) {
            if (this.displayMoreDetails) {
                this.contentGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '1.5em')
                    .attr('fill', this.context.theme.errorColor)
                    .text(this.error);
            } else {
                this.contentGroup.append('a')
                .on('click', this.showDetails)
                .style('cursor', 'pointer')
                .append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '1.5em')
                    .attr('fill', this.context.theme.secondaryColor)
                    .text('More details');
            }
        }

        if (this.retry) {
            this.retryGroup = this.svg.append('g');
            this.resizeActions.push(() => {
                const scale = Math.max(1, this.size.width / 400);
                const offset = 16 * scale + 5;
                this.retryGroup
                    .attr('transform', `translate(${this.size.width - offset}, 5) scale(${scale})`);
            });
            const link = this.retryGroup.append('g').append('a')
                .style('cursor', 'pointer')
                .on('click', this.retry);
            link.append('rect')
                .attr('width', 16)
                .attr('height', 16)
                .style('fill-opacity', 0);
            link.append('path')
                    .attr('fill', this.context.theme.color)
                    .attr('d', 'M14 1a1 1 0 0 0-1 1v1.146A6.948 6.948 0 0 0 1.227 6.307' +
                               'a1 1 0 1 0 1.94.484A4.983 4.983 0 0 1 8 3a4.919 4.919 0 0 1 3.967 2' +
                               'H10a1 1 0 0 0 0 2h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm.046 7.481' +
                               'a1 1 0 0 0-1.213.728A4.983 4.983 0 0 1 8 13a4.919 4.919 0 0 1-3.967-2' +
                               'H6a1 1 0 0 0 0-2H2a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-1.146' +
                               'a6.948 6.948 0 0 0 11.773-3.161 1 1 0 0 0-.727-1.212z');
        }

        this.resizeActions.forEach(action => action());
    }
}
