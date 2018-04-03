import { schemeCategory10 } from 'd3';
import { Theme } from '../commonTypes';

export default class DarkTheme implements Theme {
    get background() { return 'black'; }
    get color() { return 'white'; }
    get errorColor() { return 'darkred'; }
    get secondaryColor() { return 'dodgerblue'; }
    get tooltipColor() { return 'white'; }
    get tooltipBackground() { return 'black'; }
    get neutralColor() { return 'gray'; }
    get colorScheme() { return schemeCategory10; }
    highlight = (color: d3.RGBColor | d3.HSLColor, k = 1) => color.brighter(k);
    playDown = (color: d3.RGBColor | d3.HSLColor, k = 1) => color.darker(k);
}