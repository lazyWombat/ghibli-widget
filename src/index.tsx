import _ from 'lodash';
import Widget from './widget';

var widgetElements = document.getElementsByClassName('ghibli-widget');

if (widgetElements) {
    _.map(widgetElements, widgetElement => new Widget(widgetElement));
}
