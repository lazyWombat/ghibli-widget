import { Theme } from '../commonTypes';

export default class LightTheme implements Theme {
    get background() { return 'white'; }
    get color() { return 'black'; }
    get errorColor() { return 'red'; }
    get secondaryColor() { return 'dodgerblue'; }
    get tooltipColor() { return 'black'; }
    get tooltipBackground() { return 'white'; }
    get neutralColor() { return 'gray'; }
    highlight = (color: d3.RGBColor | d3.HSLColor, k = 1) => color.darker(k);
    playDown = (color: d3.RGBColor | d3.HSLColor, k = 1) => color.brighter(k);
}