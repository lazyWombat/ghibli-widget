import { Context, Theme, GhibliService, BoxOfficeService } from './commonTypes';
import { GhibliServiceImpl } from './services/ghibliService';
import BoxOfficeServiceImpl from './services/boxOfficeService';

class ServiceAccessor {
    server: () => string;
    _ghibliService: GhibliService;
    _boxOfficeService: BoxOfficeService;

    constructor(serverAccessor: () => string) {
        this.server = serverAccessor;
    }

    get ghibliService() { return this.getGhibliService(); }
    get boxOfficeService() { return this.getBoxOfficeService(); }

    getGhibliService = () => {
        if (!this._ghibliService) { this._ghibliService = new GhibliServiceImpl(this.server()); }
        return this._ghibliService;
    }
    getBoxOfficeService = () => {
        if (!this._boxOfficeService) { this._boxOfficeService = new BoxOfficeServiceImpl(); }
        return this._boxOfficeService;
    }
}

export default class ContextImpl implements Context {
    _root: Element;
    _theme: Theme;
    _server: string | null | undefined;
    _serviceAccessor: ServiceAccessor;

    constructor(root: Element, theme: Theme, server: string | null | undefined) {
        this._root = root;
        this._theme = theme;
        this._server = server;
        this._serviceAccessor = new ServiceAccessor(() => this.server);
    }

    get root() { return this._root; }
    get theme() { return this._theme; }   
    get server() { 
        this.ensureServerExists();
        return this._server as string;
    }

    ensureServerExists = () => { if (!this._server) { throw new Error('Missing data-server attribute'); }};

    get services() { return this._serviceAccessor; }
}
