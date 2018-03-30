import * as d3 from 'd3';
import Tooltip from './tooltip';

interface MultiCenterBubbleSelectors<Datum> {
    id: (item: Datum) => string;
    group: (item: Datum) => string;
    radius: (item: Datum) => number;
    category: (item: Datum) => string;
    tooltip: (item: Datum) => string;
}

interface Node {
    id: string;
    radius: number;
    value: number;
    group: string;
    category: string;
    tooltip: string;
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

export default class MultiCenterBubbleChart<Datum> {
    maxValue: number;
    fillColor: d3.ScaleOrdinal<string, string>;
    bubbles: d3.Selection<d3.BaseType, Node, d3.BaseType, {}>;
    width: number;
    height: number;
    selectors: MultiCenterBubbleSelectors<Datum>;
    nodes: Node[];
    svg: d3.Selection<d3.BaseType, {}, null, undefined>;
    circles: d3.Selection<d3.BaseType, Node, d3.BaseType, {}>;
    simulation: d3.Simulation<Node, undefined>;
    displayMode: DisplayMode;
    groups: Map<string, Group>;
    tooltip: Tooltip;
    groupWidth: number;

    constructor(width: number, 
                height: number, 
                selectors: MultiCenterBubbleSelectors<Datum>,
                data: Datum[] | null | undefined) {
        this.width = width;
        this.height = height;
        this.selectors = selectors;
        this.nodes = [];

        this.displayMode = DisplayMode.Center;
        this.simulation = d3.forceSimulation<Node>()
            .velocityDecay(velocityDecay)            
            .force('x', d3.forceX().strength(forceStrength).x(this.width / 2))
            .force('y', d3.forceY().strength(forceStrength).y(this.height / 2))
            .force('charge', d3.forceManyBody().strength(this.charge))
            .on('tick', this.ticked)
            .stop();

        this.fillColor = d3.scaleOrdinal(d3.schemeCategory10);

        this.createNodes(data || []);

        this.tooltip = new Tooltip();
    }

    charge = (d: Node) => -Math.pow(d.radius, 2.0) * forceStrength;

    ticked = () => this.bubbles.attr('cx', d => d.x).attr('cy', d => d.y);

    getRadiusScale = () => {
        const maxRadius = Math.max(10, Math.min(this.width, this.height) / 25);
        return d3.scalePow().exponent(0.5).domain([0, this.maxValue]).range([2, maxRadius]);
    }

    createGroups = (data: Datum[]) => {
        this.groups = new Map<string, Group>();
        data.map(this.selectors.group).forEach(group => {
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

    createNodes = (data: Datum[]) => {
        this.maxValue = d3.max(data, d => this.selectors.radius(d)) || 0;
        const radiusScale = this.getRadiusScale();

        this.createGroups(data);

        this.nodes = data.map(item => (
            {
                id: this.selectors.id(item),
                radius: radiusScale(this.selectors.radius(item)),
                value: this.selectors.radius(item),
                group: this.selectors.group(item),
                category: this.selectors.category(item),
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                tooltip: this.selectors.tooltip(item)
            }));
        this.nodes.sort((a, b) => b.value - a.value);
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
        d3.select(d3.event.currentTarget).attr('stroke', 'black');
        this.tooltip.show(d.tooltip, d3.event);             
    }

    hideDetails = (d: Node) => {
        d3.select(d3.event.currentTarget).attr('stroke', d3.rgb(this.fillColor(d.category)).darker().toString());
        this.tooltip.hide();
    }

    updateData = (data: Datum[]) => this.createNodes(data);

    resize = (width: number, height: number, selection: d3.Selection<d3.BaseType, {}, null, undefined>) => {
        this.width = width;
        this.height = height;

        selection.select('svg')
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

    render = (selection: d3.Selection<d3.BaseType, {}, null, undefined>) => {
        this.svg = selection.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        selection.append('a')
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
            .attr('stroke', d => d3.rgb(this.fillColor(d.category)).darker().toString())
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