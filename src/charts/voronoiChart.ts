import * as d3 from 'd3';
import { Theme, Selection } from '../commonTypes';

interface VoronoiSelectors<Datum> {
    id: (item: Datum) => string;
    title: (item: Datum) => string;
    category: (item: Datum) => string;
    x: (item: Datum) => number;
    y: (item: Datum) => number;
    r: (item: Datum) => number;
}

export default class VoronoiChart<Datum> {
    margin: { left: number; top: number; right: number; bottom: number; };
    svg: d3.Selection<d3.BaseType, {}, null, undefined>;
    wrapper: d3.Selection<d3.BaseType, {}, null, undefined>;
    color: d3.ScaleOrdinal<string, string>;
    data: Datum[] | null | undefined;
    theme: Theme;
    selectors: VoronoiSelectors<Datum>;
    height: number;
    width: number;
    opacity: number;

    constructor(width: number, 
                height: number, 
                selectors: VoronoiSelectors<Datum>,
                data: Datum[] | null | undefined,
                theme: Theme) {
        this.width = width;
        this.height = height;
        this.selectors = selectors;
        this.theme = theme;
        this.data = data;
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        this.margin = { left: 60, top: 20, right: 20, bottom: 50 };
        this.opacity = 0.8;
    }

    updateData = (data: Datum[]) => { 
        // do nothing 
    }
    resize = (width: number, height: number, selection: Selection) => {    
        // do nothing
    }
    showTooltip = (d: Datum) => {
        if (d && this.wrapper) {
            const element = this.wrapper.selectAll(`.circles.id-${this.selectors.id(d)}`);
            const x = +element.attr('cx');
            const y = +element.attr('cy');
            const r = +element.attr('r');
            const color = element.style('fill');
            // tslint:disable-next-line:no-console
            console.log(x, y, color);
            this.wrapper.append('g')
                .attr('class', 'guide')
                .append('line')
                    .attr('x1', x).attr('x2', x)
                    .attr('y1', y + r).attr('y2', this.contentHeight + 20)
                    .style('stroke', color)
                    .style('opacity', 0)
                    .style('pointer-events', 'none')
                .transition().duration(200)
                    .style('opacity', this.opacity);
            this.wrapper.append('text')
                .attr('class', 'guide')
                .attr('x', x).attr('y', this.contentHeight + 38)
                .style('stroke', color)
                .style('fill', color)
                .style('font-size', '14px')
                .style('font-weight', '600')
                .style('pointer-events', 'none')
                .style('text-size-adjust', '100%')
                .style('opacity', 0)
                .style('text-anchor', 'middle')
                .text(this.selectors.x(d))
            .transition().duration(200)
                .style('opacity', this.opacity);
                
            this.wrapper.append('g')
                .attr('class', 'guide')
                .append('line')
                    .attr('x1', x - r).attr('x2', -20)
                    .attr('y1', y).attr('y2', y)
                    .style('stroke', color)
                    .style('opacity', 0)
                    .style('pointer-events', 'none')
                .transition().duration(200)
                    .style('opacity', this.opacity);
            this.wrapper.append('text')
                .attr('class', 'guide')
                .attr('x', -30).attr('y', y)
                .attr('dy', '0.35em')
                .style('stroke', color)
                .style('fill', color)
                .style('font-size', '14px')
                .style('font-weight', '600')
                .style('pointer-events', 'none')
                .style('text-size-adjust', '100%')
                .style('opacity', 0)
                .style('text-anchor', 'end')
                .text(d3.format('.2s')(this.selectors.y(d)))
            .transition().duration(200)
                .style('opacity', this.opacity);

            const tooltip = this.wrapper.append('g')
                .attr('class', 'tooltip');

            const margin = 5;
            const offset = 5;
            const height = 20;
            let length = 40;
            const rect = tooltip.append('rect')
                .attr('x', x - length / 2).attr('y', y - height - r - offset)
                .attr('width', 40).attr('height', height)
                .style('pointer-events', 'none')
                .style('stroke', this.theme.tooltipColor)
                .style('fill', this.theme.tooltipBackground);

            const text = tooltip.append('text')
                .attr('x', x + margin).attr('y', y - height - r - offset + 15)
                .style('pointer-events', 'none')
                .style('fill', this.theme.tooltipColor)
                .text(this.selectors.title(d));

            if (y - height - r - offset < 0) {
                rect.attr('y', y + r + offset);
                text.attr('y', y + r + offset + 15);
            }
            length = (text.node() as SVGTextContentElement).getComputedTextLength();
            rect.attr('width', length + 10);
            const posX = Math.max(0, Math.min(this.contentWidth - length + margin * 2, x - length / 2 - margin));
            rect.attr('x', posX);
            text.attr('x', posX + margin);
        }
    }
    removeTooltip = (d: Datum, index: number, elements: d3.BaseType[]) => {
        if (d && this.wrapper) {
            this.wrapper.selectAll('.tooltip').remove();
            this.wrapper.selectAll('.guide')
                .transition().duration(200)
                .style('opacity', 0)
                .remove();
        }
    }
    get contentWidth() { return this.width - this.margin.left - this.margin.right; }
    get contentHeight() { return this.height - this.margin.top - this.margin.bottom; }

    render = (selection: Selection) => {
        if (!this.data) { return; }
        
        this.svg = selection.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.wrapper = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // set the x-axis
        const xScale = d3.scaleLinear()
            .range([0, this.contentWidth])
            .domain(d3.extent(this.data, d => this.selectors.x(d)) as [number, number])
            .nice();

        const xAxis = d3.axisBottom(xScale).ticks(5);

        let axis = this.wrapper.append('g')
            .attr('transform', `translate(0, ${this.contentHeight})`)
            .call(xAxis);
        axis.selectAll('line').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('path').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('text').style('stroke', this.theme.color).style('font-size', '10px').style('font-weight', 400);
    
        // set the y-axis
        const yScale = d3.scaleLinear()
            .range([this.contentHeight, 0])
            .domain(d3.extent(this.data, d => this.selectors.y(d)) as [number, number])
            .nice();

        const yAxis = d3.axisLeft(yScale).ticks(6);

        axis = this.wrapper.append('g')
            .attr('transform', 'translate(0,0)')
            .style('stroke', this.theme.color)
            .call(yAxis);
        axis.selectAll('line').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('path').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('text').style('stroke', this.theme.color).style('font-size', '10px').style('font-weight', 400);

        const rScale = d3.scalePow().exponent(0.5)
            .domain(d3.extent(this.data, d => this.selectors.y(d)) as [number, number])
            .range([5, 12]);
    
        // voronoi
        const voronoi = d3.voronoi<Datum>()
            .x(d => xScale(this.selectors.x(d)))
            .y(d => yScale(this.selectors.y(d)))
            .extent([[0, 0], [this.contentWidth, this.contentHeight]]);

        const voronoiDiagram = voronoi(this.data);

        this.wrapper.append('g')
            .selectAll('.clip')
            .data(voronoiDiagram.polygons())
            .enter().append('clipPath')
            .attr('class', 'clip')
            .attr('id', d => d ? `clip-${this.selectors.id(d.data)}` : null)
            .append('path')
            .attr('class', 'clip-path-circle')
            .attr('d', d => d ? 'M' + d.join(',') + 'Z' : null);
        
        this.wrapper.append('g').selectAll('.circles')
            .data(this.data.sort((a, b) => d3.ascending(this.selectors.y(a), this.selectors.y(b))))
            .enter().append('circle')
            .attr('class', d => `circles id-${this.selectors.id(d)}`)
            .style('opacity', this.opacity)
            .style('fill', d => this.color(this.selectors.category(d)))
            .attr('cx', d => xScale(this.selectors.x(d)))
            .attr('cy', d => yScale(this.selectors.y(d)))
            .attr('r', d => rScale(this.selectors.r(d)));
            
        this.wrapper.append('g').selectAll('.circle-wrapper')
            .data(this.data.sort((a, b) => d3.ascending(this.selectors.y(a), this.selectors.y(b))))
            .enter().append('circle')
            .attr('class', d => `circle-wrapper id-${this.selectors.id(d)}`)
            .attr('clip-path', d => `url(#clip-${this.selectors.id(d)})`)
            .attr('cx', d => xScale(this.selectors.x(d)))
            .attr('cy', d => yScale(this.selectors.y(d)))
            .style('fill', 'none')
            .attr('r', 50)
            .style('pointer-events', 'all')
            .on('mouseover', this.showTooltip)
            .on('mouseout', this.removeTooltip);

        this.wrapper.append('g')
            .selectAll('path')
            .data(voronoiDiagram.polygons())
            .enter().append('path')
            .attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
            .style('fill', 'none')
            .style('stroke', 'none');

        this.wrapper.append('g')
            .append('text')
            .attr('text-anchor', 'end')
            .attr('font-size', '12px')            
            .attr('transform', `translate(${this.contentWidth},${this.contentHeight - 10})`)
            .style('pointer-events', 'none')
            .style('fill', this.theme.color)
            .text('Release year');

        this.wrapper.append('g')
            .append('text')
            .attr('text-anchor', 'end')
            .attr('font-size', '12px')
            .attr('transform', 'translate(18, 0) rotate(-90)')
            .style('pointer-events', 'none')
            .style('fill', this.theme.color)
            .text('Gross revenue');
    }
}