import { Theme } from '../commonTypes';

export default class DarkTheme implements Theme {
    get background() { return 'black'; }
    get color() { return 'white'; }
    get errorColor() { return 'darkred'; }
    get secondaryColor() { return 'dodgerblue'; }
    get tooltipColor() { return 'white'; }
    get tooltipBackground() { return 'black'; }
    get neutralColor() { return 'gray'; }
    highlight = (color: d3.RGBColor | d3.HSLColor, k = 1) => color.brighter(k);
    playDown = (color: d3.RGBColor | d3.HSLColor, k = 1) => color.darker(k);
}