import * as d3 from 'd3';

export default class Tooltip {
    // tslint:disable-next-line:no-any
    tooltip: d3.Selection<d3.BaseType, {}, HTMLElement, any>;
    constructor() {
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('border', '1px solid black')
            .style('background-color', 'black')
            .style('padding', '5px')
            .style('display', 'flex')
            .style('color', 'white')
            .style('pointer-events', 'none');
        this.hide();
    }

    // tslint:disable-next-line:no-any
    show = (content: string, event: any) => {
        this.tooltip.style('opacity', 1.0)
            .html(content);
        this.updatePosition(event);
    }

    hide = () => this.tooltip.style('opacity', 0.0);

    // tslint:disable-next-line:no-any
    updatePosition = (event: any) => {
        const xOffset = 20;
        const yOffset = 10;

        const width = parseInt(this.tooltip.style('width'), 10);
        const height = parseInt(this.tooltip.style('height'), 10);

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const cursorX = (document.all) ? event.clientX + scrollX : event.pageX;
        const cursorY = (document.all) ? event.clientY + scrollY : event.pageY;

        const left = ((cursorX - scrollX + xOffset * 2 + width) > window.innerWidth)
            ? cursorX - width - xOffset * 2 : cursorX + xOffset;
        let top = ((cursorY - scrollY + yOffset * 2 + height) > window.innerHeight)
            ? cursorY - height - yOffset * 2 : cursorY + yOffset;

        if (top < scrollY + yOffset) { top = cursorY + yOffset; }

        this.tooltip
            .style('top', `${top}px`)
            .style('left', `${left}px`);
    }
}