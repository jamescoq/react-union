/* eslint-disable no-console */
const fs = require('fs-extra'); // eslint-disable-line import/no-extraneous-dependencies
const mkdirp = require('mkdirp'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path'); // eslint-disable-line import/no-extraneous-dependencies
const rimraf = require('rimraf'); // eslint-disable-line import/no-extraneous-dependencies

const appBundleName = process.argv[2];
const DEBUG = !process.argv.includes('--release');

const appBundleFileName = `${appBundleName}.js`;
const vendorBundleName = 'vendor';
const vendorBundleFileName = `${vendorBundleName}.js`;
const manifestFileName = 'assetManifest.json';

/* Place your main app bundle name here. The name is referenced in hero-portlet/src/main/resources/META-INF/resources/view.jsp */
const LIFERAY_APP_BUNDLE_NAME = 'union';

const appDirectory = fs.realpathSync(process.cwd());
const buildFolder = path.join(appDirectory, 'build', appBundleName);
const jsBuildFolder = path.join(buildFolder, 'js');
const targetFolder = path.join(appDirectory, 'build/loader');
const targetJSFolder = path.join(targetFolder, 'js');
const configFilePath = path.join(targetFolder, 'config.js');

const joinNonEmpty = xs => xs.filter(Boolean).join('.');
const getLfrFilePath = hash =>
	path.join(targetFolder, `${joinNonEmpty([LIFERAY_APP_BUNDLE_NAME, hash])}.js`);
const getLrfContextPath = hash =>
	`/o/liferay-amd-loader/${joinNonEmpty([LIFERAY_APP_BUNDLE_NAME, hash])}.js`;

const manifestFilePath = path.join(buildFolder, manifestFileName);

function createLiferayConfigSource({ name, path = null, dependencies = [] }) {
	return `Liferay.Loader.addModule({
	dependencies: ${JSON.stringify(dependencies)},
	name: ${JSON.stringify(name)},
	exports: ${JSON.stringify(name)},
	path: ${JSON.stringify(path || name)},
	type: 'js'
});`;
}

function getEntryBundlesFromManifest(manifest) {
	return {
		vendor: manifest[vendorBundleFileName],
		app: manifest[appBundleFileName],
	};
}

function getHashPart(x) {
	return x.split('.')[1];
}

/**
 * Hash is sum of hash of entry and vendor bundle
 */
function getHash(manifest) {
	if (DEBUG) {
		return '';
	}

	const paths = getEntryBundlesFromManifest(manifest);

	return `${getHashPart(paths.app)}${getHashPart(paths.vendor)}`;
}

function getLoaderSource(name, manifest) {
	const paths = getEntryBundlesFromManifest(manifest);

	return `Liferay.Loader._loadScript({ url: '${paths.vendor}' });
Liferay.Loader._loadScript({ url: '${paths.app}' });

window.${name} = {};
`;
}

function createLiferayConfig() {
	fs.readFile(manifestFilePath, 'utf8', (err, data) => {
		if (err) {
			throw new Error('Manifest file with js bundle map is missing!');
		}

		const manifest = JSON.parse(data);
		mkdirp.sync(targetFolder);

		const hash = getHash(manifest);

		fs.writeFileSync(
			getLfrFilePath(hash),
			getLoaderSource(LIFERAY_APP_BUNDLE_NAME, manifest),
			'utf8'
		);

		fs.writeFileSync(
			configFilePath,
			createLiferayConfigSource({
				name: LIFERAY_APP_BUNDLE_NAME,
				path: getLrfContextPath(hash),
			}),
			'utf8'
		);
	});
}

function copyAssets() {
	mkdirp.sync(targetJSFolder);
	fs.copySync(path.join(jsBuildFolder), path.join(targetJSFolder));
}

console.log('🚀 AMD loader config creator script start 🚀');
console.log(`cleaning ${targetFolder} folder`);
rimraf.sync(targetFolder, {}, null);
console.log('creating Liferay AMD loader configuration...');
createLiferayConfig();
console.log('copying assets...');
copyAssets();
console.log('✨ post build script finished ✨');
