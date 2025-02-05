import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';

import { CoreV1Api } from './api.js';
import { KubeConfig } from './config.js';
import { Cluster, User } from './config_types.js';

use(chaiAsPromised);

describe('FullRequest', () => {
    describe('getPods', () => {
        it('should get pods successfully', () => {
            const kc = new KubeConfig();
            const cluster = {
                name: 'foo',
                server: 'https://nowhere.foo',
            } as Cluster;
            const username = 'foo';
            const password = 'some-password';
            const user = {
                name: 'my-user',
                username,
                password,
            } as User;

            kc.loadFromClusterAndUser(cluster, user);

            const k8sApi = kc.makeApiClient(CoreV1Api);
            const result = {
                kind: 'PodList',
                apiVersion: 'v1',
                items: [],
            };
            const auth = Buffer.from(`${username}:${password}`).toString('base64');
            nock('https://nowhere.foo', {
                reqheaders: {
                    authorization: `Basic ${auth}`,
                },
            })
                .get('/api/v1/namespaces/default/pods')
                .reply(200, result);

            const promise = k8sApi.listNamespacedPod({ namespace: 'default' });

            return expect(promise).to.eventually.deep.equals(result);
        });
    });
});
