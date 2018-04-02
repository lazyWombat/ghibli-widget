import { capitalize } from 'lodash';
import { Context, Component } from './commonTypes';
import Loading from './loading';
import Error from './error';
import Films from './films';
import BoxOffice from './boxOffice';

export enum WidgetType {
    Invalid,
    Loading,
    Films,
    BoxOffice
}

function getWidgetType(s: string | null) {
    const type = (s || WidgetType.Films.toString()).split('-').map(capitalize).join('');
    return WidgetType[type] || WidgetType.Invalid;
}

export default class WidgetSelector {
    context: Context;
    constructor(context: Context) {
        this.context = context;
    }
    createErrorWidget(error: string) {
        const component = new Error();
        component.setData(error);
        return component;
    }
    createWidget(type: string | null) {
        const widgetType = getWidgetType(type);
        
        let component: Component;
        switch (widgetType) {
            case WidgetType.Loading: 
                component = new Loading();
                break;
            case WidgetType.Films:
                component = new Films();
                break;
            case WidgetType.BoxOffice:
                component = new BoxOffice();
                break;
            default:
                const error = component = new Error();
                error.setData(`Unknown widget type: ${type}`);
                break;
        }
        return component;
    }    
}
