import * as d3 from 'd3';
import { Component } from './commonTypes';

interface Arc { endAngle: number; }

export default class LoadingIndicator implements Component {
    selection: d3.Selection<d3.BaseType, {}, null, undefined>;
    width: number;
    height: number;

    constructor(selection: d3.Selection<d3.BaseType, {}, null, undefined>,
                width: number, height: number) {
        this.selection = selection;
        this.width = width;
        this.height = height;
    }
    
    resize(width: number, height: number): void {
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;

            this.selection.select('svg')
                .attr('width', width)
                .attr('height', height)
            .select('g')
                .attr('transform', `translate(${width * 0.5}, ${height * 0.5})`);
        }
    }

    spin = (selection: d3.Selection<d3.BaseType, Arc, null, undefined>, duration: number) => {
        selection.transition()
            .ease(d3.easeLinear)
            .duration(duration)
            .attrTween('transform', function() {
                return d3.interpolateString('rotate(0)', 'rotate(360)');
            });
        setTimeout(() => { this.spin(selection, duration); }, duration);
    }
        
    render(): void {
        const tau = 2 * Math.PI;
        const minRadius = 10;
        const radius = Math.max(minRadius, Math.min(this.width, this.height) / 2);
            
        const arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.9)
            .startAngle(0);
        
        this.selection.select('svg').remove();
        const svg = this.selection
            .style('background', 'white')
            .style('border', '1px solid black')
        .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
        .append('g')
            .attr('transform', `translate(${this.width * 0.5}, ${this.height * 0.5})`);

        svg.append('path')
            .datum<Arc>({endAngle: 0.33 * tau})
            .style('fill', '#4D4D4D')
            .attr('d', arc)
            .call(this.spin, 1500);
    }
}