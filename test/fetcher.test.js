import Fetcher from '../src/Dependencies/Fetcher';
import {assert} from 'chai';

describe('Dependencies', () => {
    describe('Fetcher', () => {
        describe('#fetch()', () => {
            it('should return an object with dependency tree', async () => {

                // TODO - Mock axios inside Fetcher and return predefined responses instead of requesting npmjs.org
                // TODO - Test request to own service with missing/wrong parameter
                // TODO - Add unit-tests for Fetcher tree-building mechanism

                let fetcher = new Fetcher('axios', false);
                let results = await fetcher.fetch();

                assert.typeOf(results, 'object');
                assert.hasAllKeys(results, ['axios']);
                assert.hasAllKeys(results.axios, ['follow-redirects', 'is-buffer']);
                assert.hasAllKeys(results.axios['follow-redirects'], ['debug',]);
                assert.hasAllKeys(results.axios['follow-redirects']['debug'], ['ms',]);
            });
        });
    });
});