import { select } from 'd3';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import { Context, Component } from './commonTypes';
import { Film } from './models/film';
import ThemeSelector from './themes';
import WidgetSelector from './widgetSelector';
import ContextImpl from './context';

class WidgetState {
    isLoading?: boolean;
    data?: Film[];
    error?: string;
}

export default class Widget {
    context: Context;
    element: Element;
    server: string;
    resizeSensor: ResizeSensor;
    state: WidgetState;
    prevState: WidgetState;
    content: Component;    

    constructor(element: Element) {
        this.element = element;
        const server = element.getAttribute('data-server');

        this.context = new ContextImpl(
            element, 
            ThemeSelector(element.getAttribute('data-theme')),
            server
        );

        const selection = select(element)
            .style('background', this.context.theme.background)
            .style('border', `1px solid ${this.context.theme.color}`);
        
        const widgetSelector = new WidgetSelector(this.context);

        this.content = server ? 
            widgetSelector.createWidget(element.getAttribute('data-type')) :
            widgetSelector.createErrorWidget('Missing data-server attribute');
        
        if (this.content) {
            this.content.init(
                selection, 
                {
                    width: this.element.clientWidth,
                    height: this.element.clientHeight
                },
                this.context);
            this.content.render();
        }

        this.resizeSensor = new ResizeSensor(this.element, this.onResize);
    }
    
    onResize = () => this.content && this.content.resize({ 
        width: this.element.clientWidth, 
        height: this.element.clientHeight 
    })
}