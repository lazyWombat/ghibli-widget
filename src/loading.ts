import * as d3 from 'd3';
import { range } from 'lodash';
import { Component } from './commonTypes';

interface Arc { endAngle: number; }
interface Circle { 
    delay: number;
    radius: number;
    color: string;
}
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

    getCircle(i: number): Circle {
        return {
            delay: i * 100, 
            color: d3.schemeCategory10[i % d3.schemeCategory10.length],
            radius: 46 - i * 6
        };
    }

    render(): void {
        this.selection.select('svg').remove();        
        const svg = this.selection
            .style('background', 'white')
            .style('border', '1px solid black')
        .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
        .append('g')
            .attr('transform', `translate(${this.width * 0.5}, ${this.height * 0.5})`);

        svg.selectAll('circle')
        .data(range(3).map(this.getCircle)).enter()
        .append('circle')
            .attr('r', d => d.radius)
            .attr('fill', 'none')
            .attr('stroke', d => d.color)
            .attr('stroke-width', 5)
        .transition()
            .duration(250)
            .ease(d3.easeLinear)
            .delay(d => d.delay)
            .on('start', function repeat(c: Circle, index: number, circles: d3.BaseType[]) {
                const circle = d3.active(circles[index]);
                if (circle) {
                    const l = c.radius * Math.PI;
                    circle
                        .attr('stroke-dasharray', `0 0 0 ${l} 0 ${l}`)
                    .transition()
                        .attr('stroke-dasharray', `0 0 ${l} 0 0 ${l}`)
                    .transition()
                        .attr('stroke-dasharray', `0 0 ${l} 0 0 ${l}`)
                    .transition()
                        .attr('stroke-dasharray', `0 ${l} 0 ${l} 0 ${l}`)
                    .transition()
                        .attr('stroke-dasharray', `0 ${l} 0 ${l} 0 ${l}`)
                    .transition()
                        .on('start', repeat);
                }
            });
    }
}