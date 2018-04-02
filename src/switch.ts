import { Component, Selection, Size, Context } from './commonTypes';

export default class Switch implements Component {
    index: number;
    size: Size;
    context: Context;
    selection: Selection;
    content: Selection;
    current: Component;
    components: Component[];
    componentFactories: (() => Component)[];

    constructor(components: (() => Component)[], index: number = 0) {
        this.componentFactories = components;
        this.components = [];
        this.index = index;
    }
    
    clearContent = () => this.content && this.content.selectAll('*').remove();

    select(index: number) {        
        this.index = index;
        if (!this.selection) { return null; }
        if (!this.components[index]) {
            this.components[index] = this.componentFactories[index]();
            this.clearContent();
            this.components[index].init(this.content, this.size, this.context);            
            this.current = this.components[index];
        } else if (this.current !== this.components[index]) {
            this.clearContent();
            this.current = this.components[index];
        }
        return this.current;
    }

    init = (selection: Selection, size: Size, context: Context) => {
        this.selection = selection;
        this.content = selection.append('div')
            .attr('width', size.width)
            .attr('height', size.height);
        this.context = context;
        this.size = size;

        this.select(this.index);
    }

    resize = (size: Size) => {               
        this.size = size;
        if (this.current) { this.current.resize(size); }
    }

    render = () => {
        if (this.current) {
            this.current.render();
        }
    }
}