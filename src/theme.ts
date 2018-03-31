import { WidgetTheme, Theme } from './commonTypes';

class LightTheme implements Theme {
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
class DarkTheme implements Theme {
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

export default function(theme: WidgetTheme) {
    return theme === WidgetTheme.Dark ? new DarkTheme() : new LightTheme();
}