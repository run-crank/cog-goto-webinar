import { Axios } from 'axios';

export class RegistrantAwareMixin {
  client: Axios;
  clientReady: Promise<boolean>;

  public async createRegistrant(registrant: Record<string, any>, webinarKey: string, organizerKey: string): Promise<Record<string, any>> {
    await this.clientReady;
    return await this.client.post(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants`, registrant, { transformResponse: [data => data] });
  }

  public async deleteRegistrant(registrantKey: string, webinarKey: string, organizerKey: string): Promise<Record<string, any>> {
    await this.clientReady;
    return await this.client.delete(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants/${registrantKey}`, { transformResponse: [data => data] });
  }

  public async getRegistrantByRegistrantKey(registrantKey: string, webinarKey: string, organizerKey: string): Promise<Record<string, any>> {
    await this.clientReady;
    return await this.client.get(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants/${registrantKey}`, { transformResponse: [data => data] });
  }
}
