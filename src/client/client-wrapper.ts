import axios from 'axios';
import * as querystring from 'query-string';
import * as grpc from 'grpc';
import { Field } from '../core/base-step';
import { RegistrantAwareMixin } from './mixins';

class ClientWrapper {

  public static expectedAuthFields: Field[] = [];

  public client: any;
  public clientReady: Promise<boolean>;

  constructor(auth: grpc.Metadata, clientConstructor = axios) {
    this.client = clientConstructor;

    try {
      if (auth.get('refreshToken').toString() && auth.get('clientId').toString() && auth.get('clientSecret').toString()) {
        this.clientReady = new Promise(async (resolve, reject) => {
          try {
            const authToken = Buffer.from(`${auth.get('clientId').toString()}:${auth.get('clientSecret').toString()}`).toString('base64');

            const tokenResponse = await this.client.post('https://authentication.logmeininc.com/oauth/token', querystring.stringify({
              'grant_type': 'refresh_token',
              'refresh_token': auth.get('refreshToken').toString(),
            }), {
              headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            });

            if (tokenResponse.data['access_token']) {
              this.client.defaults.baseURL = 'https://api.getgo.com/G2W/rest/v2';
              this.client.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data['access_token']}`;
              this.client.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
              this.client.defaults.headers.get['Content-Type'] = 'application/json';

              resolve(true);
            } else {
              reject('Access Token was not retrieved. Please try to reconnect.');
            }
          } catch (e) {
            reject(e.response.data);
          }
        });
      } else {
        this.clientReady = Promise.reject('Refresh Token was not provided. Try reconnecting to you hubspot instance.');
      }
    } catch (e) {
      throw e;
    }
  }
}

interface ClientWrapper extends RegistrantAwareMixin { }
applyMixins(ClientWrapper, [RegistrantAwareMixin]);

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      // tslint:disable-next-line:max-line-length
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

export { ClientWrapper as ClientWrapper };
