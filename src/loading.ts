import * as d3 from 'd3';
import { Component, Context, Size, Selection } from './commonTypes';

export default class LoadingIndicator implements Component {
    context: Context;
    selection: Selection;
    size: Size;

    init(selection: Selection, size: Size, context: Context) {
        this.selection = selection;
        this.size = size;
        this.context = context;

        this.render = this.renderImpl;
        this.resize = this.resizeImpl;
    }

    render() { /* do nothing */ }
    resize(size: Size) { /* do nothing */ }

    resizeImpl(size: Size): void {
        this.size = size;
        if (this.selection) {
            const half = [ size.width / 2, size.height / 2 ].map(Math.floor);
            this.selection.select('svg')
                .attr('width', size.width)
                .attr('height', size.height)
            .select('g')
                .attr('transform', `translate(${half[0]}, ${half[1]})`);
        }
    }

    renderImpl(): void {
        this.selection.select('svg').remove();
        const half = [ this.size.width / 2, this.size.height / 2 ].map(Math.floor);
        const svg = this.selection.append('svg')
            .attr('width', this.size.width)
            .attr('height', this.size.height)
        .append('g')
            .attr('transform', `translate(${half[0]}, ${half[1]})`);

        const numberOfBars = 10;
        const barWidth = () => Math.max(1, Math.min(100, Math.floor(Math.min(
            this.size.width, this.size.height) / numberOfBars / 4)));
        const size = () => barWidth() * numberOfBars;
        const barDelay = 100;
        const boxDelay = 1000;
        const duration = 1500;

        let count = 0;
        const translateLeft = (x: number) => `translate(${-this.size.width / 2 - x - barWidth()})`;
        const translateRight = (x: number) => `translate(${this.size.width / 2 - x})`;
        const getColor = () => d3.color(d3.schemeCategory10[(count + 1) % d3.schemeCategory10.length]);
        const theme = () => this.context.theme;

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