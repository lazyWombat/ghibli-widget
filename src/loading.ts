import * as d3 from 'd3';
import { uniqueId } from 'lodash';
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
        const theme = () => this.context.theme;
        const numberOfBars = 10;
        const barWidth = () => Math.max(1, Math.min(100, Math.floor(Math.min(
            this.size.width, this.size.height) / numberOfBars / 4)));
        const size = () => barWidth() * numberOfBars;
        const barDelay = 100;
        const boxDelay = 1000;
        const duration = 1500;
        
        this.selection.select('svg').remove();
        const half = [ this.size.width / 2, this.size.height / 2 ].map(Math.floor);
        const svg = this.selection.append('svg');
        const gradientId = uniqueId('label-');
        const blinkWidth = 60;
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0').attr('x2', '100%')
            .attr('y1', '0').attr('y2', '0');
        gradient.append('stop')
            .attr('stop-color', 'green')
            .attr('offset', '-10%');
        gradient.append('stop')
            .attr('stop-color', 'white')
            .attr('offset', `${blinkWidth / 2 - 10}%`);
        gradient.append('stop')
            .attr('stop-color', 'green')
            .attr('offset', `${blinkWidth - 10}%`);
        gradient.append('stop')
            .attr('stop-color', 'green')
            .attr('offset', '100%');
        gradient.append('animate')
            .attr('attributeName', 'x1')
            .attr('values', `${-blinkWidth}%;${200 - blinkWidth}%;`)
            .attr('dur', '1500ms')
            .attr('repeatCount', 'indefinite');
        gradient.append('animate')
            .attr('attributeName', 'x2')
            .attr('values', `${100 - blinkWidth}%;${300 - blinkWidth}%;`)
            .attr('dur', '1500s')
            .attr('repeatCount', 'indefinite');

        const group = svg
            .attr('width', this.size.width)
            .attr('height', this.size.height)
        .append('g')
            .attr('transform', `translate(${half[0]}, ${half[1]})`);

        let count = 0;
        const translateLeft = (x: number) => `translate(${-this.size.width / 2 - x - barWidth()})`;
        const translateRight = (x: number) => `translate(${this.size.width / 2 - x})`;
        const getColor = () => d3.color(theme().colorScheme[(count + 1) % theme().colorScheme.length]);

        group.selectAll('rect')
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
                            .attr('width', barWidth() + 0.1)
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

        const fontSize = () => Math.max(12, size() / 3);
        group.append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', `url(#${gradientId})`)
            .attr('font-family', 'sans-serif')
            .attr('font-size', `${fontSize()}px`)
            .attr('y', size() / 2 + fontSize())
            .text('Loading')
        .transition()
            .on('start', function repeat(d: {}, index: number, texts: d3.BaseType[]) {
                const self = d3.select(texts[index]);
                if (self) {
                    self.transition()
                        .duration(duration)
                        .attr('y', size() / 2 + fontSize())
                        .attr('font-size', `${fontSize()}px`)
                    .transition()
                        .delay(boxDelay + duration + 2 * numberOfBars * barDelay)
                        .on('start', repeat);
                }
            });

        gradient.transition()
            .on('start', function repeat(d: {}, index: number, elements: d3.BaseType[]) {
                const self = d3.select(elements[index]);
                if (self) {
                    self.selectAll('stop')
                        .transition().duration(duration)
                        .attr('stop-color', (_, i) => i !== 1 
                            ? theme().highlight(getColor()).toString() 
                            : 'white')
                        .transition().duration(duration)
                        .delay(boxDelay + 2 * numberOfBars * barDelay)
                        .attr('stop-color', (_, i) => i !== 1 
                            ? theme().color 
                            : 'white');
                    self.transition()
                        .delay(2 * duration + boxDelay + 2 * numberOfBars * barDelay)
                        .on('start', repeat);
                }
            });
    }
}