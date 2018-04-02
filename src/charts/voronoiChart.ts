import * as d3 from 'd3';
import { Component, Selection, Context, Size } from '../commonTypes';
import Tooltip, { TooltipFn } from './embeddedTooltip';

interface Node {
    id: string;
    title: string;
    category: string;
    x: number;
    y: number;
    r: number;
    tooltip: TooltipFn;
}

type VoronoiSelector<Datum> = (data: Datum) => Node;

type GroupSelectorFn = (selection: Selection, className: string) => Selection;

export default class VoronoiChart<Datum> implements Component {
    tooltip: Tooltip;
    selection: d3.Selection<d3.BaseType, {}, null, undefined>;
    context: Context;
    margin: { left: number; top: number; right: number; bottom: number; };
    svg: d3.Selection<d3.BaseType, {}, null, undefined>;
    wrapper: d3.Selection<d3.BaseType, {}, null, undefined>;
    color: d3.ScaleOrdinal<string, string>;
    selector: VoronoiSelector<Datum>;
    height: number;
    width: number;
    opacity: number;
    nodes: Node[];

    constructor(selectors: VoronoiSelector<Datum>) {
        this.selector = selectors;
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        this.margin = { left: 60, top: 20, right: 20, bottom: 50 };
        this.opacity = 0.8;
        this.nodes = [];
    }

    init(selection: Selection, size: Size, context: Context) {
        this.selection = selection;
        this.width = size.width;
        this.height = size.height;
        this.context = context;
        this.tooltip = new Tooltip(context, size, this.margin);
        this.render = this.renderImpl;
        this.resize = this.resizeImpl;
    }

    render() { /* do nothing */ }
    resize(size: Size) { /* do nothing */ }

    get theme() { return this.context.theme; }

    updateData = (data: Datum[]) => { 
        this.nodes = data.map(this.selector);
        this.nodes.sort((a, b) => d3.descending(a.r, b.r));
    }
    
    resizeImpl = (size: Size) => {
        this.width = size.width;
        this.height = size.height;
        if (this.tooltip) { this.tooltip.updateBounds(size); }
        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        const xScale = d3.scaleLinear()
            .range([0, this.contentWidth])
            .domain(d3.extent(this.nodes, n => n.x) as [number, number])
            .nice();

        const xAxis = d3.axisBottom(xScale).ticks(5);

        this.wrapper.select('.x-axis')
            .attr('transform', `translate(0, ${this.contentHeight})`)
            .call(xAxis);

        const yScale = d3.scaleLinear()
            .range([this.contentHeight, 0])
            .domain(d3.extent(this.nodes, n => n.y) as [number, number])
            .nice();

        const yAxis = d3.axisLeft(yScale).ticks(6);

        this.wrapper.select('.y-axis')
            .attr('transform', 'translate(0,0)')
            .call(yAxis);

        this.wrapper.select('.x-axis-label')
            .attr('transform', `translate(${this.contentWidth},${this.contentHeight - 10})`);

        const rScale = d3.scalePow().exponent(0.5)
            .domain(d3.extent(this.nodes, n => n.r) as [number, number])
            .range([5, 12]);

        this.renderNodes(xScale, yScale, rScale,
                         (selection: Selection, className: string) => selection.select(`.${className}`),
                         true);
    }

    selectNode = (d: Node) => {
        if (d && this.wrapper) {
            const element = this.wrapper.selectAll(`.circles.id-${d.id}`);
            const x = +element.attr('cx');
            const y = +element.attr('cy');
            const r = +element.attr('r');
            const color = element.style('fill');

            this.renderGuide(
                x, x, y + r, this.contentHeight + 20,
                color, x, this.contentHeight + 38, d.x.toString(),
                'middle');

            this.renderGuide(
                x - r, -20, y, y,
                color, -30, y, d3.format('.2s')(d.y),
                'end'
            );

            this.tooltip.update(x, y, r, d.tooltip);
        }
    }
    
    removeSelection = () => {
        this.tooltip.hide();
        if (this.wrapper) {
            this.wrapper.selectAll('.guide')
                .transition().duration(200)
                .style('opacity', 0)
                .remove();
        }
    }

    renderGuide = (x1: number, x2: number, y1: number, y2: number, 
                   color: string, tx: number, ty: number, text: string,
                   textAnchor: string) => {
        this.wrapper.append('g')
        .attr('class', 'guide')
        .append('line')
            .attr('x1', x1).attr('x2', x2)
            .attr('y1', y1).attr('y2', y2)
            .style('stroke', color)
            .style('opacity', 0)
            .style('pointer-events', 'none')
        .transition().duration(200)
            .style('opacity', this.opacity);
        this.wrapper.append('text')
            .attr('class', 'guide')
            .attr('x', tx).attr('y', ty)
            .attr('dy', '0.3em')
            .style('fill', color)
            .style('font-size', '14px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .style('text-size-adjust', '100%')
            .style('opacity', 0)
            .style('text-anchor', textAnchor)
            .text(text)
        .transition().duration(200)
            .style('opacity', this.opacity);
    }

    get contentWidth() { return this.width - this.margin.left - this.margin.right; }
    get contentHeight() { return this.height - this.margin.top - this.margin.bottom; }

    renderImpl = () => {
        this.svg = this.selection.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.wrapper = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // set the x-axis
        const xScale = d3.scaleLinear()
            .range([0, this.contentWidth])
            .domain(d3.extent(this.nodes, n => n.x) as [number, number])
            .nice();

        const xAxis = d3.axisBottom(xScale).ticks(5);

        let axis = this.wrapper.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this.contentHeight})`)
            .call(xAxis);
        axis.selectAll('line').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('path').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('text').style('fill', this.theme.color).style('font-size', '10px').style('font-weight', 400);
    
        // set the y-axis
        const yScale = d3.scaleLinear()
            .range([this.contentHeight, 0])
            .domain(d3.extent(this.nodes, n => n.y) as [number, number])
            .nice();

        const yAxis = d3.axisLeft(yScale).ticks(6);

        axis = this.wrapper.append('g')
            .attr('class', 'y-axis')
            .attr('transform', 'translate(0,0)')
            .call(yAxis);
        axis.selectAll('line').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('path').style('stroke', this.theme.color).style('shape-rendering', 'crispEdges');
        axis.selectAll('text').style('fill', this.theme.color).style('font-size', '10px').style('font-weight', 400);
        
        const rScale = d3.scalePow().exponent(0.5)
            .domain(d3.extent(this.nodes, n => n.r) as [number, number])
            .range([5, 12]);

        this.renderNodes(xScale, yScale, rScale,
                         (selection: Selection, className: string) => selection.append('g').attr('class', className));

        this.wrapper.append('g')
            .append('text')
            .attr('class', 'x-axis-label')
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

    renderNodes = (xScale: d3.ScaleContinuousNumeric<number, number>, 
                   yScale: d3.ScaleContinuousNumeric<number, number>, 
                   rScale: d3.ScaleContinuousNumeric<number, number>,
                   groupSelector: GroupSelectorFn, isUpdate: boolean = false) => {
        // voronoi
        const voronoi = d3.voronoi<Node>()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .extent([[-this.margin.left, -this.margin.top], [this.contentWidth, this.contentHeight]]);

        const voronoiDiagram = voronoi(this.nodes);

        if (isUpdate) {
            groupSelector(this.wrapper, 'clip-group')
                .selectAll('.clip')
                .data(voronoiDiagram.polygons())
                .select('path')
                .attr('d', d => d ? 'M' + d.join(',') + 'Z' : null);

            groupSelector(this.wrapper, 'circle-group')
                .selectAll('.circles')
                .data(this.nodes)
                .attr('cx', d => xScale(d.x))
                .attr('cy', d => yScale(d.y))
                .attr('r', d => rScale(d.r));
                
            groupSelector(this.wrapper, 'circle-wrapper-group')
                .selectAll('.circle-wrapper')
                .data(this.nodes)
                .attr('cx', d => xScale(d.x))
                .attr('cy', d => yScale(d.y));            
        } else {
            groupSelector(this.wrapper, 'clip-group')
            .selectAll('.clip')
            .data(voronoiDiagram.polygons())
            .enter().append('clipPath')
            .attr('class', 'clip')
            .attr('id', d => d ? `clip-${d.data.id}` : null)
            .append('path')
            .attr('class', 'clip-path-circle')
            .attr('d', d => d ? 'M' + d.join(',') + 'Z' : null);
        
            groupSelector(this.wrapper, 'circle-group')
                .selectAll('.circles')
                .data(this.nodes)
                .enter().append('circle')
                .attr('class', d => `circles id-${d.id}`)
                .style('opacity', this.opacity)
                .style('fill', d => this.color(d.category))
                .attr('cx', d => xScale(d.x))
                .attr('cy', d => yScale(d.y))
                .attr('r', d => rScale(d.r));

            groupSelector(this.wrapper, 'circle-wrapper-group')
                .selectAll('.circle-wrapper')
                .data(this.nodes)
                .enter().append('circle')
                .attr('class', d => `circle-wrapper id-${d.id}`)
                .attr('clip-path', d => `url(#clip-${d.id})`)
                .attr('cx', d => xScale(d.x))
                .attr('cy', d => yScale(d.y))
                .style('fill', 'none')
                .attr('r', 50)
                .style('pointer-events', 'all')
                .on('mouseover', this.selectNode)
                .on('mouseout', this.removeSelection);
                
            groupSelector(this.wrapper, 'voronoi-group')
                .selectAll('path')
                .data(voronoiDiagram.polygons())
                .enter().append('path')
                .attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
                .style('fill', 'none')
                .style('stroke', 'none');
        }
    }
}