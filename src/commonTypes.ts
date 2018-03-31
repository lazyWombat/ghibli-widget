export type Selection = d3.Selection<d3.BaseType, {}, null, undefined>;
export enum WidgetType {
    Invalid,
    Loading,
    Films,
    BoxOffice
}
export enum WidgetTheme {
    Light,
    Dark
}
export interface Component {
    resize(width: number, height: number): void;
    render(): void;
}
export interface DataComponent<Datum> extends Component {
    setData(data: Datum): void;
}
export interface BoxOffice {
    grossRevenue(title: string): number | undefined;
}
export interface Theme {
    readonly background: string;
    readonly color: string;
    readonly errorColor: string;
    readonly secondaryColor: string;
    readonly tooltipColor: string;
    readonly tooltipBackground: string;
    readonly neutralColor: string;
    highlight(color: d3.RGBColor | d3.HSLColor, k?: number): d3.RGBColor | d3.HSLColor;
    playDown(color: d3.RGBColor | d3.HSLColor, k?: number): d3.RGBColor | d3.HSLColor;
}