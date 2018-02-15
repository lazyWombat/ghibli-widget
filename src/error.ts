import * as d3 from 'd3';
import { DataComponent } from './commonTypes';

export default class ErrorMessage implements DataComponent<string> {
    width: number;
    height: number;
    selection: d3.Selection<d3.BaseType, {}, null, undefined>;
    error: string;

    constructor(selection: d3.Selection<d3.BaseType, {}, null, undefined>,
                width: number, height: number, data: string) {
        this.selection = selection;
        this.width = width;
        this.height = height;
        this.error = data;
    }

    setData(data: string) {
        this.error = data;
        this.render();
    }

    resize(width: number, height: number) {
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;
            this.selection.select('svg')
                .attr('width', this.width)
                .attr('height', this.height)
            .select('g')
                .attr('transform', `translate(${this.width * 0.5}, ${this.height * 0.5})`);
        }
    }

    render() {
        this.selection.select('svg').remove();
        const svg = this.selection
            .style('background', 'white')
            .style('border', '1px solid black')
        .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
        .append('g')
            .attr('transform', `translate(${this.width * 0.5}, ${this.height * 0.5})`);

        svg.append('text')
            .attr('text-anchor', 'middle')
            .text(`Error: ${this.error}`);
    }
}
