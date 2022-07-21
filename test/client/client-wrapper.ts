import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';
import * as querystring from 'query-string';

import { ClientWrapper } from '../../src/client/client-wrapper';
import { Metadata } from 'grpc';

chai.use(sinonChai);

describe('ClientWrapper', () => {
  const expect = chai.expect;
  let axiosStub: any;
  let metadata: Metadata;
  let clientWrapperUnderTest: ClientWrapper;

  beforeEach(() => {
    axiosStub = sinon.stub();
    axiosStub.post = sinon.stub();
    axiosStub.delete = sinon.stub();
    axiosStub.get = sinon.stub();
    axiosStub.defaults = {
      baseURL: '',
      headers: {
        common: {
          Authorization: '',
        },
        post: {
          'Content-Type': '',
        }
      }
    };

    axiosStub.post.returns(Promise.resolve({
      data: {
        access_token: 'anyToken'
      }
    }));
  });

  it('authenticates', () => {
    // Construct grpc metadata and assert the client was authenticated.
    const expectedCallArgs = { 
      clientId: 'anyId',
      clientSecret: 'anySecret',
      refreshToken: 'anyToken',
    };
    metadata = new Metadata();
    metadata.add('clientId', expectedCallArgs.clientId);
    metadata.add('clientSecret', expectedCallArgs.clientSecret);
    metadata.add('refreshToken', expectedCallArgs.refreshToken);

    // Assert that the underlying API client was authenticated correctly.
    clientWrapperUnderTest = new ClientWrapper(metadata, axiosStub);
    expect(axiosStub.post).to.have.been.calledWith('https://authentication.logmeininc.com/oauth/token', querystring.stringify({
      'grant_type': 'refresh_token',
      'refresh_token': expectedCallArgs.refreshToken,
    }), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${expectedCallArgs.clientId}:${expectedCallArgs.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  });

  it('createRegistrant', () => {
    clientWrapperUnderTest = new ClientWrapper(metadata, axiosStub);
    const organizerKey = 'anyKey';
    const webinarKey = 'anyKey';
    const registrant = {};

    clientWrapperUnderTest.createRegistrant({}, 'anyKey', 'anyKey');
    // TODO: Fix this test
    // expect(axiosStub.post).to.have.been.calledWith(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants`, registrant, { transformResponse: [data => data] });
  });

  it('deleteRegistrant', () => {
    clientWrapperUnderTest = new ClientWrapper(metadata, axiosStub);
    const organizerKey = 'anyKey';
    const webinarKey = 'anyKey';
    const registrantKey = 'anyKey';
    
    clientWrapperUnderTest.deleteRegistrant('anyKey', 'anyKey', 'anyKey');
    // TODO: Fix this test
    // expect(axiosStub.delete).to.have.been.calledWith(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants/${registrantKey}`, { transformResponse: [data => data] });
  });

  it('getRegistrantByRegistrantKey', () => {
    clientWrapperUnderTest = new ClientWrapper(metadata, axiosStub);
    const organizerKey = 'anyKey';
    const webinarKey = 'anyKey';
    const registrantKey = 'anyKey';
    
    clientWrapperUnderTest.getRegistrantByRegistrantKey('anyKey', 'anyKey', 'anyKey');
    // TODO: Fix this test
    // expect(axiosStub.get).to.have.been.calledWith(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants/${registrantKey}`, { transformResponse: [data => data] });
  });

});
