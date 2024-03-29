/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';

export class CreateRegistrantStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Create a GoTo Webinar registrant';
  protected stepExpression: string = 'create a goto webinar registrant';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected actionList: string[] = ['create'];
  protected targetObject: string = 'Registrant';

  protected expectedFields: Field[] = [{
    field: 'webinarKey',
    type: FieldDefinition.Type.STRING,
    description: 'Webinar Key',
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
      description: 'The Registrant Id',
    }, {
      field: 'registrantKey',
      type: FieldDefinition.Type.STRING,
      description: 'The Registrant\'s registrant key',
    }, {
      field: 'joinUrl',
      type: FieldDefinition.Type.STRING,
      description: 'The Registrant\'s join Url',
    }],
    dynamicFields: true,
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData().toJavaScript();
    const organizerKey = stepData.organizerKey || '12345'; // organizer key is not needed but still has to have a value
    const webinarKey = stepData.webinarKey;
    const registrant = stepData.registrant;

    try {
      let data: any = await this.client.createRegistrant(registrant, webinarKey, organizerKey);
      data = data.data;
      // There is an issue with bigInt where the it is not showing the complete registrantId
      // Using regex, put quotes on the registrantKey to get full key when parsed
      data = data.replace(/([\[:])?(\d+)([,\}\]])/g, '$1\"$2\"$3');
      data = JSON.parse(data);

      registrant['registrantKey'] = data['registrantKey'];
      registrant['joinUrl'] = data['joinUrl'];

      const record = this.createRecord(registrant);
      const passingRecord = this.createPassingRecord(registrant, Object.keys(registrant));
      const orderedRecord = this.createOrderedRecord(registrant, stepData['__stepOrder']);

      return this.pass('Successfully created GoTo Webinar registrant', [], [record, passingRecord, orderedRecord]);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        return this.error(`${JSON.parse(e.response.data).description}: %s`, [JSON.stringify({ webinarKey, organizerKey })]);
      }

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

  public createPassingRecord(data, fields): StepRecord {
    const filteredData = {};
    if (data) {
      Object.keys(data).forEach((key) => {
        if (fields.includes(key)) {
          filteredData[key] = data[key];
        }
      });
    }
    return this.keyValue('exposeOnPass:registrant', 'Created Registrant', filteredData);
  }

  public createOrderedRecord(registrant, stepOrder = 1): StepRecord {
    const record = this.keyValue(`registrant.${stepOrder}`, `Created Registrant from Step ${stepOrder}`, registrant);
    return record;
  }
}

export { CreateRegistrantStep as Step };
