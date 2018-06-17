## Ghibli widget

This is a d3 exercise. The project combines d3, typescript, webpack together to come up with a widget.

## Usage

### Running the project

```sh
yarn start
```

The browser window opens automatically and the widget starts working.

### Creating a production build

```sh
yarn build
```

### Updating the images

The image references for the movies are taken using Microsoft Congnitive services. It is possible that some of them become stale. Please obtain the API key from Microsoft and re-run utils/get-posters.py script. It will update the image references using Bing image search.

```powershell
$env:BING_SEARCH_API_KEY="your-api-key-here"; .\get-posters.py
```

Paste the script output into src/poster.ts file

## Details

The typescript / webpack combo is taken from https://github.com/Microsoft/TypeScript-React-Starter

All React libraries are thrown away to limit the size of the build.
