export interface Component {
    resize(width: number, height: number): void;
    render(): void;
}

export interface DataComponent<Datum> extends Component {
    setData(data: Datum): void;
}
