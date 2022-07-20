/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';

export class CreateRegistrantStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Create a GoTo Webinar Registrant';
  protected stepExpression: string = 'create a goto webinar registrant';
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
    field: 'registrant',
    type: FieldDefinition.Type.MAP,
    description: 'A map of field names to field values',
  }];

  protected expectedRecords: ExpectedRecord[] = [{
    id: 'registrant',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'id',
      type: FieldDefinition.Type.STRING,
      description: 'The Registrant\'s ID',
    }, {
      field: 'registrantKey',
      type: FieldDefinition.Type.STRING,
      description: 'The Registrant\'s registrant key',
    }, {
      field: 'joinUrl',
      type: FieldDefinition.Type.STRING,
      description: 'The Registrant\'s join URL',
    }],
    dynamicFields: true,
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData().toJavaScript();
    const organizerKey = stepData.organizerKey;
    const webinarKey = stepData.webinarKey;
    const registrant = stepData.registrant;

    try {
      let data = await this.client.createRegistrant(registrant, webinarKey, organizerKey);
      // Reassign data from axios response
      data = data.data;
      // Append registrationKey and joinUrl from create response
      registrant['registrantKey'] = data['registrantKey'];
      registrant['joinUrl'] = data['joinUrl'];
      const orderedRecord = this.createOrderedRecord(registrant, stepData['__stepOrder']);

      const record = this.createRecord(registrant);
      return this.pass('Successfully created GoTo Webinar registrant', [], [record, orderedRecord]);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        return this.error('Registrant %s is already registered in webinar with id %s', [registrant.email, webinarKey]);
      }

      return this.error('There was an error creating the registrant in GoTo Webinar: %s', [
        e.toString(),
      ]);
    }
  }

  public createRecord(registrant): StepRecord {
    const record = this.keyValue('registrant', 'Created Registrant', registrant);
    return record;
  }

  public createOrderedRecord(registrant, stepOrder = 1): StepRecord {
    const record = this.keyValue(`registrant.${stepOrder}`, `Created Registrant from Step ${stepOrder}`, registrant);
    return record;
  }
}

export { CreateRegistrantStep as Step };
