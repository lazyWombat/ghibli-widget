import { capitalize } from 'lodash';
import LightTheme from './light';
import DarkTheme from './dark';

enum WidgetTheme {
    Light,
    Dark
}

export default function(themeName: string | null) {
    const theme = WidgetTheme[capitalize(themeName || '')] || WidgetTheme.Light;
    return theme === WidgetTheme.Dark ? new DarkTheme() : new LightTheme();
}