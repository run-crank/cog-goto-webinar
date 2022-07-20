import { Axios } from 'axios';

export class RegistrantAwareMixin {
  client: Axios;
  clientReady: Promise<boolean>;

  public async createRegistrant(registrant: Record<string, any>, webinarKey: string, organizerKey: string): Promise<Record<string, any>> {
    await this.clientReady;
    return await this.client.post(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants`, registrant);
  }

  public async deleteRegistrant(registrantKey: string, webinarKey: string, organizerKey: string): Promise<Record<string, any>> {
    await this.clientReady;
    return await this.client.delete(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants/${registrantKey}`);
  }

  public async getRegistrantByRegistrantKey(registrantKey: string, webinarKey: string, organizerKey: string): Promise<Record<string, any>> {
    await this.clientReady;
    return await this.client.get(`/organizers/${organizerKey}/webinars/${webinarKey}/registrants/${registrantKey}`);
  }
}
