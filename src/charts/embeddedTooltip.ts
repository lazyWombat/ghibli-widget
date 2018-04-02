import * as d3 from 'd3';
import { Context, Size, Selection } from '../commonTypes';

export type TooltipFn = (content: Selection) => void;

export default class Tooltip {
    selection: Selection;
    box: Selection;
    context: Context;
    bounds: Size;
    margin: { left: number; top: number; };

    constructor(context: Context, 
                bounds: Size, 
                margin: { left: number, top: number},                
            ) {
        this.context = context;        
        this.bounds = bounds;        
        this.margin = margin;
        this.selection = d3.select(this.context.root).append('div')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('visibility', 'hidden');
        const rgbColor = d3.color(this.context.theme.tooltipColor).rgb();
        const shadowColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.g}, 0.2)`;
        this.selection.insert('div', 'div')
            .style('position', 'absolute')
            .style('box-shadow', `0 4px 8px ${shadowColor}`)
            .style('width', '100%')
            .style('height', '100%');
        this.box = this.selection.append('div')
            .style('position', 'absolute')
            .style('fill', this.context.theme.tooltipBackground)
            .style('stroke', this.context.theme.tooltipColor)
            .style('stroke-opacity', 0.5);
    }

    update = (x: number, y: number, r: number, updateFn: TooltipFn) => {
        this.selection.select('.tooltip-content').remove();
        const content = this.selection.append('div')
            .attr('class', 'tooltip-content')
            .style('position', 'absolute')
            .style('padding', '6px')
            .style('box-sizing', 'border-box');

        updateFn(content);

        const width = parseInt(content.style('width'), 10);
        const height = parseInt(content.style('height'), 10);

        this.selection.style('width', width + 'px').style('height', height + 'px');

        const offset = 7;
        const beakSize = 5;
        
        // the standard tooltip location is above the circle
        // but if there is not enough space the tooltip is moved
        
        // first check the vertical dimension
        let yPos = y - r - height - offset + this.margin.top;
        let inverted = false;
        if (yPos < 0) { 
            yPos = y + r + offset - beakSize + this.margin.top; 
            inverted = true;
        }
        // next check if it is enough space in both horizontal directions
        // and shift the tooltip
        let xPos = x - width / 2 + this.margin.left;
        let xShift = 0;
        // if tooltip is wider than the allowed area there is no point to shift it
        if (width <= this.bounds.width) {
            if (xPos < 0) {
                xShift = xPos;
                xPos = 0;
            } else if (xPos + width > this.bounds.width) {
                xShift = xPos - this.bounds.width + width;
                xPos = this.bounds.width - width;
            }
        }

        this.box.select('svg').remove();
        this.box.append('svg')
            .attr('width', width)
            .attr('height', height + offset)
        .append('path')
            .attr('transform', `translate(${width / 2}, ${inverted ? 0 : height + beakSize })`)
        .attr('d', this.createBeakBoxPath(beakSize, width, height, inverted, xShift));
        
        this.selection
            .style('left', xPos + 'px')
            .style('top', yPos + 'px')
            .style('visibility', 'visible');
    }
    
    hide = () => this.selection.style('visibility', 'hidden');

    createBeakBoxPath(beakSize: number, boxWidth: number, boxHeight: number, 
                      inverted: boolean = false, shift: number = 0) {
        const halfWidth = boxWidth / 2 - 1;

        const vBeakSize = inverted ? -beakSize : beakSize;
        if (inverted) { boxHeight = -boxHeight; }

        return `M${shift},0l${beakSize},${-vBeakSize}` + 
            `H${halfWidth}v${-boxHeight}H${-halfWidth}v${boxHeight}H${-beakSize + shift}Z`;
    }
}