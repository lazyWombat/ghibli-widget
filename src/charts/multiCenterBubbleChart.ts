import * as d3 from 'd3';
import { Component, Selection, Context, Size } from '../commonTypes';
import Tooltip, { TooltipFn } from './globalTooltip';

type MultiCenterBubbleSelector<Datum> = (data: Datum) => {
    id: string,
    group: string,
    radius: number,
    category: string,
    tooltip: TooltipFn,
};

interface Node {
    id: string;
    radius: number;
    value: number;
    group: string;
    category: string;
    tooltip: TooltipFn;
    x: number;
    y: number;
}

interface Group {
    x: number;
    name: string;
}

enum DisplayMode {
    Center,
    Split
}

const forceStrength = 0.03;
const velocityDecay = 0.2;

export default class MultiCenterBubbleChart<Datum> implements Component {
    selection: Selection;
    context: Context;
    maxValue: number;
    fillColor: d3.ScaleOrdinal<string, string>;
    bubbles: d3.Selection<d3.BaseType, Node, d3.BaseType, {}>;
    width: number;
    height: number;
    selector: MultiCenterBubbleSelector<Datum>;
    nodes: Node[];
    svg: d3.Selection<d3.BaseType, {}, null, undefined>;
    circles: d3.Selection<d3.BaseType, Node, d3.BaseType, {}>;
    simulation: d3.Simulation<Node, undefined>;
    displayMode: DisplayMode;
    groups: Map<string, Group>;
    tooltip: Tooltip;
    groupWidth: number;

    constructor(selector: MultiCenterBubbleSelector<Datum>) {
        this.selector = selector;
        this.nodes = [];
        this.displayMode = DisplayMode.Center;
    }

    init(selection: Selection, size: Size, context: Context) {
        this.context = context;
        this.selection = selection;
        this.width = size.width;
        this.height = size.height;
        this.fillColor = d3.scaleOrdinal(context.theme.colorScheme);
        this.tooltip = new Tooltip(this.context.theme);

        this.render = this.renderImpl;
        this.resize = this.resizeImpl;
    }

    render() { /* do nothing */ }
    resize(size: Size) { /* do nothing */ }

    createNodes = (data: Datum[]) => {
        this.nodes = data.map(this.selector).map(d => (
            { 
                ...d, 
                x: 0,
                y: 0,
                radius: 0,
                value: d.radius
            }));
        this.maxValue = d3.max(this.nodes, n => n.value) || 0;
        this.createGroups(this.nodes.map(n => n.group));
        this.nodes.sort((a, b) => d3.descending(a.value, b.value));
    }

    charge = (d: Node) => -Math.pow(d.radius, 2.0) * forceStrength;

    ticked = () => this.bubbles.attr('cx', d => d.x).attr('cy', d => d.y);

    getRadiusScale = () => {
        const maxRadius = Math.max(10, Math.min(this.width, this.height) / 25);
        return d3.scalePow().exponent(0.5).domain([0, this.maxValue]).range([2, maxRadius]);
    }

    createGroups = (groups: string[]) => {
        this.groups = new Map<string, Group>();
        groups.forEach(group => {
            this.groups.set(group, { x: this.width / 2, name: group });
        });
        this.recalculateGroupPositions();
    }

    recalculateGroupPositions = () => {        
        const count = this.groups.size;
        if (count) {
            this.groupWidth = this.width / (count + 3);

            let x = this.groupWidth * 2; // start with margin

            Array.from(this.groups.values(), group => {
                group.x = x;
                x += this.groupWidth;
            });
        } else {
            this.groupWidth = this.width;
        }
    }

    nodeGroupPosition = (node: Node) => {
        const group = this.groups.get(node.group);
        return group ? group.x : this.width / 2;
    }

    hideGroupLabels = () => {
        this.svg.selectAll('.group').remove();
    }

    showGroupLabels = () => {
        this.svg.selectAll('.group').remove();
        this.svg.selectAll('.group')
            .data(Array.from(this.groups.values()))
            .enter()            
        .append('text')
            .attr('class', 'group')
            .attr('x', d => d.x)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .attr('fill', this.context.theme.color)
            .text(d => d.name)
            .each(this.wrapText(this.groupWidth, 5));
    }

    groupBubbles = () => {
        this.simulation.force('x', d3.forceX().strength(forceStrength).x(this.width / 2));
        this.hideGroupLabels();
        this.simulation.alpha(1).restart();
    }

    splitBubbles = () => {
        this.simulation.force('x', d3.forceX().strength(forceStrength).x(this.nodeGroupPosition));
        this.showGroupLabels();
        this.simulation.alpha(1).restart();
    }

    showDetails = (d: Node) => {
        d3.select(d3.event.currentTarget).attr('stroke', this.context.theme.color);
        this.tooltip.show(d.tooltip, d3.event);             
    }

    hideDetails = (d: Node) => {
        d3.select(d3.event.currentTarget).attr(
            'stroke', 
            this.context.theme.highlight(d3.rgb(this.fillColor(d.category))).toString());
        this.tooltip.hide();
    }

    updateData = (data: Datum[]) => this.createNodes(data);

    resizeImpl = (size: Size) => {
        this.width = size.width;
        this.height = size.height;

        this.selection.select('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.recalculateGroupPositions();

        this.simulation
            .force('x', d3.forceX().strength(forceStrength).x(this.width / 2))
            .force('y', d3.forceY().strength(forceStrength).y(this.height / 2))
            .force('charge', d3.forceManyBody().strength(this.charge));
        
        const radiusScale = this.getRadiusScale();
        this.nodes.forEach(node => node.radius = radiusScale(node.value));
        this.bubbles.transition()
            .duration(2000)
            .attr('r', d => d.radius);

        if (this.displayMode === DisplayMode.Center) {
            this.groupBubbles();
        } else {
            this.splitBubbles();
        }
    }

    toggleDisplay = () => {
        if (this.displayMode === DisplayMode.Center) {
            this.displayMode = DisplayMode.Split;
            this.splitBubbles();
        } else {
            this.displayMode = DisplayMode.Center;
            this.groupBubbles();
        }
    }
    
    wrapText(width: number, padding: number) {
        return function(group: Group, index: number, groups: d3.BaseType[]) {
            const self = d3.select(groups[index]);
            const node = self && self.node() as SVGTextContentElement;
            if (node) {          
                let textLength = node.getComputedTextLength();
                let text = group.name;

                while (textLength > 0 && textLength > (width - 2 * padding)) {
                    text = text.slice(0, -1);
                    self.text(text + '...');
                    textLength = node.getComputedTextLength();
                }
            }
        };
    }

    renderImpl = () => {
        const radiusScale = this.getRadiusScale();
                
        this.nodes.forEach(n => {
            n.x = Math.random() * this.width;
            n.y = Math.random() * this.height;
            n.radius = radiusScale(n.value);
        });

        this.simulation = d3.forceSimulation<Node>()
            .velocityDecay(velocityDecay)            
            .force('x', d3.forceX().strength(forceStrength).x(this.width / 2))
            .force('y', d3.forceY().strength(forceStrength).y(this.height / 2))
            .force('charge', d3.forceManyBody().strength(this.charge))
            .on('tick', this.ticked)
            .stop();

        this.svg = this.selection.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.selection.append('a')
            .on('click', this.toggleDisplay)
            .style('cursor', 'pointer')
            .style('position', 'absolute')
            .style('top', '5px')
            .style('right', '0.5em')
            .append('text')
                .style('color', '#0078d7')
                .text('Toggle');
        
        this.bubbles = this.svg.selectAll('.bubble')
            .data(this.nodes, d => (<Node> d).id);

        const newBubbles = this.bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 0)
            .attr('fill', d => this.fillColor(d.category))
            .attr('stroke', d => this.context.theme.highlight(d3.rgb(this.fillColor(d.category))).toString())
            .attr('stroke-width', 2)
            .on('mouseover', this.showDetails)
            .on('mouseout', this.hideDetails);

        this.bubbles = this.bubbles.merge(newBubbles);

        this.bubbles.transition()
            .duration(2000)
            .attr('r', d => d.radius);

        this.simulation.nodes(this.nodes);

        this.groupBubbles();
    }
}