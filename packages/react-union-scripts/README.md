**Work-in-progress**

# React-union-scripts

Extendable and configurable set of scripts for building and running your React applications that is designed for not a typical Node environments such as Content Management Systems (CMS) or Java Portals.

## Main features

* **simple to use** - just add the dependency to your `package.json` and roll
* **use multiple entry points in one project** - useful for theming or for splitting your code to optimize bundle size
* **designed for large codebase** - multiple entry points, splitting code, async loading of JavaScript modules

## Installation

```sh
yarn add react react-dom && yarn add react-union-scripts --dev
```

or

```sh
npm install react react-dom && npm install --save-dev react-union-scripts
```

## Usage

**TL;DR** You can use one of our [examples](https://github.com/lundegaard/react-union/tree/master/boilerplates/react-union-boilerplate-basic) as a boilerplate for your project instead.

1. Simulate output of your server in development

Create `<project root>/public/YourAppName/index.ejs`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

For details how to write a template, see [https://github.com/jantimon/html-webpack-plugin](html-webpack-plugin).

2. To your `package.json` add scripts:

```json
{
	"scripts": {
		"start": "react-union-scripts start --app YourAppName",
		"build": "react-union-scripts build"
	}
}
```

3. Create `<project root>/src/apps/YourAppName/index.js`:

```jsx
import React from 'react';
import { render } from 'react-dom';

render('Hello World', document.getElementById('root'));
```

4. Run your project

**Development server**

```
yarn start --app YourAppName
```

**Start proxy server**

```
yarn start --app YourAppName --proxy
```

**Production build**

Build all registered apps.

```
yarn build --release
```

or build just one

```
yarn build --app YourAppName --release
```

**Running Jest tests**

Run in watch mode

```
yarn test
```

or run just once

```
yarn test --release
```

**Analyze build**

Runs [`webpack-bundle-analyzer`](https://github.com/th0r/webpack-bundle-analyzer).

```
yarn start --app YourAppName --analyze
```

## Monorepo Usage

**TL;DR** You can use our mono repo example [examples](https://github.com/lundegaard/react-union/tree/master/boilerplates/react-union-boilerplate-monorepo) as a boilerplate for your project instead.

Usage is mostly same as in uni repo, but it has a few differences.
	* There are two types of packages - `widgets` and `apps`.
		* The are distinguished by pattern .*union-app.* and .*union-widget.*. Pattern can be changed in `union.config.js`.
	* App name must reflect folder name and must be in dash-case. `YourAppName > union-app-your-app-name`
	* You can use as many workspaces as you want. Eg. ['packages/*'] or ['apps/*', 'widgets/*'].

## CLI

### `analyze`
- available for: `start`

Runs [`webpack-bundle-analyzer`](https://github.com/th0r/webpack-bundle-analyzer).

Example:

```
react-union-scripts start --app MyApp --analyze
```

### `app`
- available for: `start`, `build`

Determines what application to build or start.

Example:

```
react-union-scripts start --app MyApp
```

### `no-hmr`
- available for: `start`, `build`

If is set, hot module replacement is off.

Example:

```
react-union-scripts start --no-hmr
```

### `proxy`
- available for: `start`.

If is set, we start proxy server instead of development server.

Example:

```
react-union-scripts start --proxy
```


### `release`
- available for: `start`, `build`

If is set, the build is optimized for production.

Example:

```
react-union-scripts build --release
```

### `target`
- available for: `start`, `build`

Custom value that can be used in `union.config.js`.

Example:

```
react-union-scripts build --target wordpress
```

### `verbose`
- available for: `start`, `build`

If is set, the console output is more verbose.

Example:

```
react-union-scripts build --verbose
```


## `union.config.js`

Place the file into the root of your project if you want to configure react-union-scripts.

Configuration file can export either:
- static JSON object or
- function.

To the function is passed object that describes flags derived from calling our CLI api:

```js
// example of dynamic union.config.js
module.exports = ({
	target, // custom value
	script, // build, start or test
	app,
	debug,
	proxy,
	verbose,
	noHmr,
	analyze,
}) => ({
	outputMapper: target === 'liferay' ? { js: 'widgets/js' } : {},
});
```

Resulting configuration can redefine following properties.

### `devServer`

[`devServer.port`]\(number): port of proxy server. Defaults to `3300`.
[`devServer.historyApiFallback`]\(boolean): If `true`, then add [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback) middleware. Defaults to `true`.

### `proxy`

[`proxy.port`]\(number): port of proxy server. Defaults to `3300`.

[`proxy.target`]\(string): target of proxy

[`proxy.publicPath`]\(string): Public path of the application. See [webpack](https://github.com/webpack/docs/wiki/configuration#outputpublicpath). Required if you want to run proxy.

### `outputMapper`

Output mapper makes possible further customization of the folder structure that is produced by the build. All paths are relative to the `apps[].paths.build` directory.

[`outputMapper.js`]\(string): Path of JavaScript assets. Defaults to `static/js`.
[`outputMapper.media`]\(string): Path of media assets. Defaults to `static/media`.

### `clean`


[`outputMapper.paths`]\(string): Paths to clean before build. By default equals to `[paths.build]`
[`outputMapper.oprions`]\(object): See [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin)


### `apps`

Array of configurations for your applications. Every configuration is merged with above properties. You can rewrite them separately for every application.

For example in the config:

```js
module.exports = {
	proxy: { port: 3333 },
	apps: [
		{
			name: 'MyFirstApp',
			proxy: { port: 5000 },
		},
		{ name: 'MySecondApp' },
	],
};
```

MyFirstApp will use proxy port `5000` and MySecondApp will use common value `3333`.

[`apps[].name`]\(string): Name of your application that is used for both:
- finding HTML template in `./public` directory and
- naming your bundle file.
Required.

[`apps[].paths.build`]\(string) Path to the build directory. Defaults to `<project root>/build/[ApplicationName]`.

[`apps[].paths.public`]\(string) Path to public directory. Directory should contain:
- static assets, that will be copied to the build directory
- a HTML template that is named according to `templateFilename` property.
Defaults to `<project root>/public/[ApplicationName]`.

[`apps[].paths.index`]\(string) Path to entry file of a the application. Defaults to `<project root>/apps/[ApplicationName]`.

### `templateFilename`

[`templateFilename`]\(string): Name of the HTML template. Defaults to `index.ejs`.

### `generateTemplate`

[`generateTemplate`]\(boolean) If true, generates template by using html-webpack-plugin. Defaults to `true`.

### `generateVendorBundle`

[`generateVendorBundle`]\(boolean) If true, generates separate vendor chunk. Vendors are all dependencies from your `package.json`. Defaults to `true`.

### `vendorBlackList`

['vendorBlackList']\(array[string]) List of depenedencies that should not be included within vendor chunk. Defaults to `[]`.

### `mergeWebpackConfig`

[`mergeWebpackConfig`]\(function) If specified, `webpack.config` generated by `react-union-scripts` is passed as the argument. Function must return new valid webpack config.

### `asyncSuffix`

['asyncSuffix']\(string, array[string], RegExp) Suffix for files to load chunks async. Defaults to `widget`.

### `copyToPublicIgnore`

['copyToPublicIgnore']\(RegExp) Pattern for files that should not be copied from `public` folder in build process. Defaults to `/\.ejs$/`.

## Testing
We are currently using Jest as the main tesing framework.
How to add your favourite React testing framework see [recipe](#tesing-with-enzyme).

For custom cofiguration use `jest` key withing your main `package.json`. We are currently supporting following keys:

```js
	'collectCoverageFrom',
	'coverageReporters',
	'coverageThreshold',
	'resetMocks',
	'resetModules',
	'snapshotSerializers',
	'watchPathIgnorePatterns'
```
**Note:** If you need [`setupTestFrameworkScriptFile`](http://jestjs.io/docs/en/configuration#setuptestframeworkscriptfile-string) configuration option, just create `testsSetup.js` file inside your root folder.

See jest [configuration options](http://jestjs.io/docs/en/configuration).

### `workspaces`

Workspaces can rewrite default patterns for monorepo matching.

[`workspaces.widgetPattern`]\(string, array[string], RegExp): Pattern for the widget packages. Defaults to `union-widget`.
[`workspaces.appPattern`]\(string, array[string], RegExp): Patter for the app packages. Defaults to `union-app`.


## Recipes

### Extending `webpack.config`

If you need customize webpack.config generated by `react-union-scripts`, specify function `mergeWebpackConfig` in `union.config.js`.

```js
module.exports = {
	mergeWebpackConfig: (config) => {
		console.log(config);
// 		Outputs:
// 		{
// 			"context": "...",
// 			"entry": {
// 			"vendor": [...],
// 			"SampleApp": [...]
// 			},
// 			"output": {...},
// 			"plugins": [...],
// 			"resolve": {...},
// 			"module": {...}
// 		}

		return config;
	}
};
```

Merging webpack.configs can be tedious task. To make it little bit simplier we recommend to use [webpack-merge](https://github.com/survivejs/webpack-merge) library.

Install it by running:

```
yarn add -D webpack-merge
```

in the root of your project. Than use it in `union.config.js`, e.g.:

```js
const merge = require('webpack-merge');

module.exports = ({ debug }) => ({
	mergeWebpackConfig: (unionWebpackConfig) => merge(unionWebpackConfig, {
		devtool: debug ? 'eval' : false,
	}),
});
```

### `.ejs` templates for mocking the server output

Create your .ejs template at `/public/<YourAppName>/index.ejs`.
`YourAppName` refers to application registered within `union.config.js`.

### Asynchronous loading of modules

If there is a file with suffix ".widget.js" it is loaded by [bundle-loader](https://github.com/webpack-contrib/bundle-loader). Bundle-loader is better alternative to both [`require.ensure`](https://webpack.github.io/docs/code-splitting.html) and [`import()`];
Every async module is splitted up into individual chunks.

#### You can rewrite suffix in the union.config.js:

```js
module.exports = {
	asyncSuffix: 'widget',
	asyncSuffix: ['widget', 'async'],
	asyncSuffix: '/\.widget\.js$',
	asyncSuffix: '/\.(widget|async)\.js$',
};
```

**Example**

```jsx
// MyWidget.widget.js

const MyWidget = props => {
	// Your React component
};

export default MyWidget;
```

```js
// MyWidgetRoute.js

import loadMyWidget from './MyWidget.widget';

export default {
	path: 'my-widget',
	getComponent(done) {
		loadWidget(mod => done(mod.default));
	},
};
```

### Tesing with Enzyme

Add `enzyme` to your project:

```sh
yarn add -D enzyme enzyme-adapter-react-16
```

Create file `testsSetup.js` in root your project and paste following code:

```jsx
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
```


