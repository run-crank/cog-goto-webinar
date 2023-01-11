/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';
import * as util from '@run-crank/utilities';
import { baseOperators } from '../../client/constants/operators';

export class RegistrantFieldEqualsStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Check a field on a GoTo Webinar registrant';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'the (?<field>[a-zA-Z0-9_-]+) field on goto webinar registrant (?<registrantKey>[a-zA-Z0-9_-]+) should (?<operator>be set|not be set|be less than|be greater than|be one of|be|contain|not be one of|not be|not contain|match|not match) ?(?<expectation>.+)?';
  protected stepType: StepDefinition.Type = StepDefinition.Type.VALIDATION;
  protected actionList: string[] = ['check'];
  protected targetObject: string = 'Registrant';
  protected expectedFields: Field[] = [{
    field: 'webinarKey',
    type: FieldDefinition.Type.STRING,
    description: 'Webinar Key',
  }, {
    field: 'registrantKey',
    type: FieldDefinition.Type.STRING,
    description: 'Registrant Key',
  }, {
    field: 'field',
    type: FieldDefinition.Type.STRING,
    description: 'Field name to check',
  }, {
    field: 'operator',
    type: FieldDefinition.Type.STRING,
    optionality: FieldDefinition.Optionality.OPTIONAL,
    description: 'Check Logic (be, not be, contain, not contain, be greater than, be less than, be set, not be set, be one of, or not be one of)',
  }, {
    field: 'expectation',
    type: FieldDefinition.Type.ANYSCALAR,
    optionality: FieldDefinition.Optionality.OPTIONAL,
    description: 'Expected field value',
  }];
  protected expectedRecords: ExpectedRecord[] = [{
    id: 'registrant',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'registrantKey',
      type: FieldDefinition.Type.STRING,
      description: "Registrant's Key",
    }, {
      field: 'firstName',
      type: FieldDefinition.Type.STRING,
      description: "Registrant's First Name",
    }, {
      field: 'lastName',
      type: FieldDefinition.Type.STRING,
      description: "Registrant's Last Name",
    }, {
      field: 'email',
      type: FieldDefinition.Type.STRING,
      description: "Registrant's Email",
    }],
    dynamicFields: true,
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData() ? step.getData().toJavaScript() : {};
    const expectedValue = stepData.expectation;
    const organizerKey = stepData.organizerKey || '12345'; // organizer key is not needed but still has to have a value
    const webinarKey = stepData.webinarKey;
    const registrantKey = stepData.registrantKey;
    const operator: string = stepData.operator || 'be';
    const field = stepData.field;

    if ((expectedValue === null || expectedValue === undefined) && !(operator == 'be set' || operator == 'not be set')) {
      return this.error("The operator '%s' requires an expected value. Please provide one.", [operator]);
    }

    try {
      let data: any = await this.client.getRegistrantByRegistrantKey(registrantKey, webinarKey, organizerKey);
      data = data.data;
      // There is an issue with bigInt where the it is not showing the complete registrantId
      // Using regex, put quotes on the registrantKey to get full key when parsed
      data = data.replace(/([\[:])?(\d+)([,\}\]])/g, '$1\"$2\"$3');
      data = JSON.parse(data);
      const records = this.createRecords(data, stepData['__stepOrder']);

      if (data && data.hasOwnProperty(field)) {
        const result = this.assert(operator, data[field], expectedValue, field, stepData['__piiSuppressionLevel']);
        return result.valid ? this.pass(result.message, [], records)
          : this.fail(result.message, [], records);

      } else {
        if (data && !data.hasOwnProperty(field)) {
          return this.fail(
            'Found the registrant with key %s, but there was no %s field.',
            [registrantKey, field],
            records,
          );
        } else {
          return this.fail("Couldn't find a registrant associated with %s", [
            registrantKey,
            webinarKey,
          ]);
        }
      }
    } catch (e) {
      if (e instanceof util.UnknownOperatorError) {
        return this.error('%s Please provide one of: %s', [e.message, baseOperators.join(', ')]);
      }
      if (e instanceof util.InvalidOperandError) {
        return this.error(e.message);
      }
      if (e.response && e.response.status === 404) {
        return this.error(`${JSON.parse(e.response.data).description}: %s`, [JSON.stringify({ webinarKey, organizerKey, registrantKey })]);
      }

      return this.error('There was an error during validation of registrant field: %s', [e.message]);
    }
  }

  createRecords(registrant: Record<string, any>, stepOrder = 1) {
    const records = [];
    // Base Record
    records.push(this.keyValue('registrant', 'Checked Registrant', registrant));
    // Ordered Record
    records.push(this.keyValue(`registrant.${stepOrder}`, `Created Registrant from Step ${stepOrder}`, registrant));
    return records;
  }
}

export { RegistrantFieldEqualsStep as Step };
