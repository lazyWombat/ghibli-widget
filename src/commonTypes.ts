import { Film } from './models/film';

export type Selection = d3.Selection<d3.BaseType, {}, null, undefined>;
export type Size = { width: number; height: number; };
export interface Component {
    init(selection: Selection, size: Size, context: Context): void;
    resize(size: Size): void;
    render(): void;
}
export interface DataComponent<Datum> extends Component {
    setData(data: Datum): void;
}
export interface BoxOfficeService {
    grossRevenue(title: string): Promise<number | undefined>;
}
export interface GhibliService {
    getFilms(): Promise<Film[]>;
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
export interface Context {
    readonly root: Element;
    readonly theme: Theme;
    readonly server: string;
    readonly services: {
        readonly ghibliService: GhibliService;
        readonly boxOfficeService: BoxOfficeService;
    };
}