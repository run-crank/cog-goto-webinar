/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';

export class DeleteRegistrantStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Delete a GoTo Webinar Registrant';
  protected stepExpression: string = 'delete the (?<registrantKey>[a-zA-Z0-9_-]+) goto webinar registrant';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;

  protected expectedFields: Field[] = [{
    field: 'organizerKey',
    type: FieldDefinition.Type.STRING,
    description: 'Webinar Organizer\'s Id',
  }, {
    field: 'webinarKey',
    type: FieldDefinition.Type.STRING,
    description: 'Webinar\'s Id',
  }, {
    field: 'registrantKey',
    type: FieldDefinition.Type.STRING,
    description: 'Registrant\' Key',
  }];

  protected expectedRecords: ExpectedRecord[] = [{
    id: 'registrant',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [],
    dynamicFields: true,
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData().toJavaScript();
    const organizerKey = stepData.organizerKey;
    const webinarKey = stepData.webinarKey;
    const registrantKey = stepData.registrantKey;

    try {
      await this.client.deleteRegistrant(registrantKey, webinarKey, organizerKey);
      return this.pass('Successfully deleted GoTo Webinar registrant', []);
    } catch (e) {
      if (e.response.status === 404) {
        return this.error(`${JSON.parse(e.response.data).description}: %s`, [JSON.stringify({ webinarKey, organizerKey, registrantKey })]);
      }

      return this.error('There was an error deleting the registrant in GoTo Webinar: %s', [
        e.toString(),
      ]);
    }
  }
}

export { DeleteRegistrantStep as Step };
