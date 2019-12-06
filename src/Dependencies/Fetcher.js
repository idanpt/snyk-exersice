import axios from "axios";
import cache from 'memory-cache';

export default class Fetcher {
    constructor(packageName, useCache = true) {
        this.packageName = packageName;
        this.useCache = useCache;
        this.baseUrl = 'https://registry.npmjs.org/{packageName}/{version}';
        this.dayInMs = 86400000;
    }

    /**
     * Get NPM package's dependency tree
     * Results are cached for a day or as long as the version is the latest
     *
     * @returns {{}}
     */
    async fetch() {
        const mainPackageMeta = await this.fetchPackageMataData(this.packageName);
        let cacheKey;

        if (this.useCache) {
            // Get from cache if the version we have is still the latest
            cacheKey = `package-${this.packageName}-version-${mainPackageMeta.version}`;
            const fromCache = cache.get(cacheKey);

            if (fromCache) {
                return fromCache;
            }
        }

        const tree = await this.buildDependencyTree(mainPackageMeta);

        if (this.useCache) {
            cache.put(cacheKey, tree, this.dayInMs);
        }

        return tree;
    }


    /**
     * Build package's dependency tree
     *
     * @param packageMetaData
     * @returns {{}}
     */
    async buildDependencyTree (packageMetaData) {
        let tree = {[this.packageName]: {}};

        await this.addBranches(Object.keys(packageMetaData.dependencies || {}), tree[this.packageName]);

        return tree;
    }

    /**
     * Recursively add dependencies to the tree
     *
     * @param dependencies
     * @param tree
     * @returns {void}
     */
    async addBranches (dependencies, tree) {
        for (let depName of dependencies) {
            tree[depName] = {};
            let innerDependencies = await this.fetchPackageDependencies(depName);
            if (innerDependencies && Object.keys(innerDependencies).length > 0) {
                await this.addBranches(Object.keys(innerDependencies), tree[depName]);
            }
        }
    }

    /**
     * Fetch package's dependencies from metadata
     *
     * @param packageName
     * @param version
     * @returns {{}}
     */
    async fetchPackageDependencies (packageName, version = 'latest') {
        let metaData = await this.fetchPackageMataData(packageName, version);

        return metaData.dependencies;
    }

    /**
     * Fetch package's metadata from npm registry
     *
     * @param packageName
     * @param version
     * @returns {{}}
     */
    async fetchPackageMataData (packageName, version = 'latest') {
        const url = this.baseUrl.replace('{packageName}', packageName).replace('{version}', version);

        try {
            let res = await axios.get(url);
            return res.data;
        } catch (e) {
            console.error(e);
            return {};
        }
    }
}