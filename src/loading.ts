import * as d3 from 'd3';
import { Component, Theme, Selection } from './commonTypes';

export default class LoadingIndicator implements Component {
    theme: Theme;
    selection: Selection;
    width: number;
    height: number;

    constructor(selection: Selection,
                width: number, height: number, theme: Theme) {
        this.selection = selection;
        this.width = width;
        this.height = height;
        this.theme = theme;
    }
    
    resize(width: number, height: number): void {
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;

            this.selection.select('svg')
                .attr('width', width)
                .attr('height', height)
            .select('g')
                .attr('transform', `translate(${Math.floor(width * 0.5)}, ${Math.floor(height * 0.5)})`);
        }
    }

    render(): void {
        this.selection.select('svg').remove();        
        const svg = this.selection
            .style('background', this.theme.background)
            .style('border', `1px solid ${this.theme.color}`)
        .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
        .append('g')
            .attr('transform', `translate(${Math.floor(this.width * 0.5)}, ${Math.floor(this.height * 0.5)})`);

        const numberOfBars = 10;
        const barWidth = () => Math.max(1, Math.min(100, Math.floor(Math.min(this.width, this.height) 
            / numberOfBars / 4)));
        const size = () => barWidth() * numberOfBars;
        const barDelay = 100;
        const boxDelay = 1000;
        const duration = 1500;

        let count = 0;
        const translateLeft = (x: number) => `translate(${-this.width / 2 - x - barWidth()})`;
        const translateRight = (x: number) => `translate(${this.width / 2 - x})`;
        const getColor = () => d3.color(d3.schemeCategory10[(count + 1) % d3.schemeCategory10.length]);
        const theme = () => this.theme;

        svg.selectAll('rect')
            .data(d3.range(numberOfBars)).enter()
            .append('rect')
            .transition()
                .on('start', function repeat(d: number, index: number, bars: d3.BaseType[]) {
                    if (!d) { count++; }
                    const x = d * barWidth() - size() / 2;
                    const cx = x + barWidth() / 2;
                    const color = getColor();
                    const self = d3.select(bars[index]);
                    if (self) {
                        self
                            .attr('x', x)
                            .attr('y', - size() / 2)
                            .attr('transform', translateLeft(x) + ' rotate(0)')
                            .attr('fill', theme().playDown(color, 3).toString())
                            .attr('width', barWidth())
                            .attr('height', size())
                        .transition()
                            .delay(d * barDelay)
                            .ease(d3.easeBackOut)
                            .duration(duration)
                            .attrTween('transform', () => d3.interpolateString(
                                translateLeft(x) + `rotate(0, ${cx}, 0)`,
                                `translate(0) rotate(360, ${cx}, 0)`
                            ))
                            .attr('fill', color.toString())
                        .transition()
                            .delay(boxDelay + 2 * (numberOfBars - d) * barDelay)
                            .ease(d3.easeCubicIn)
                            .duration(duration)
                            .attrTween('transform', () => d3.interpolateString(
                                `translate(0) rotate(0, ${cx}, 0)`,
                                translateRight(x) + ` rotate(360, ${cx}, 0)`
                            ))
                            .attr('fill', theme().highlight(color, 3).toString())
                        .transition()
                            .delay(d * barDelay)
                            .on('start', repeat);
                    }
                });
                
        svg.append('text')
            .attr('text-anchor', 'middle')            
            .text('Loading')
            .transition()
                .on('start', function repeat(d: {}, index: number, texts: d3.BaseType[]) {
                    const self = d3.select(texts[index]);
                    if (self) {
                        const fontSize = Math.max(10, size() / 3);
                        self.transition()
                            .duration(duration)
                            .attr('y', size() / 2 + fontSize)
                            .attr('font-size', `${fontSize}px`)
                            .attr('fill', theme().highlight(getColor()).toString())
                        .transition()
                            .delay(boxDelay + duration + 2 * numberOfBars * barDelay)
                            .on('start', repeat);
                    }
                });
    }
}