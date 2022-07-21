import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/registrant/registrant-field-equals';

chai.use(sinonChai);

describe('RegistrantFieldEqualsStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let clientWrapperStub: any;

  beforeEach(() => {
    protoStep = new ProtoStep();
    clientWrapperStub = sinon.stub();
    clientWrapperStub.getRegistrantByRegistrantKey = sinon.stub();
    stepUnderTest = new Step(clientWrapperStub);
  });

  describe('Metadata', () => {
    it('should return expected step metadata', () => {
      const stepDef: StepDefinition = stepUnderTest.getDefinition();
      expect(stepDef.getStepId()).to.equal('RegistrantFieldEqualsStep');
      expect(stepDef.getName()).to.equal('Check a field on a GoTo Webinar Registrant');
      expect(stepDef.getExpression()).to.equal('the (?<field>[a-zA-Z0-9_-]+) field on goto webinar registrant (?<registrantKey>[a-zA-Z0-9_-]+) should (?<operator>be set|not be set|be less than|be greater than|be one of|be|contain|not be one of|not be|not contain|match|not match) ?(?<expectation>.+)?');
      expect(stepDef.getType()).to.equal(StepDefinition.Type.VALIDATION);
    });

    it('should return expected step fields', () => {
      const stepDef: StepDefinition = stepUnderTest.getDefinition();
      const fields: any[] = stepDef.getExpectedFieldsList().map((field: FieldDefinition) => {
        return field.toObject();
      });

      // organizerKey field
      const organizerKey: any = fields.find(f => f.key === 'organizerKey');
      expect(organizerKey.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
      expect(organizerKey.type).to.equal(FieldDefinition.Type.STRING);

      // webinarKey field
      const webinarKey: any = fields.find(f => f.key === 'webinarKey');
      expect(webinarKey.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
      expect(webinarKey.type).to.equal(FieldDefinition.Type.STRING);

      // registrantKey field
      const registrantKey: any = fields.find(f => f.key === 'registrantKey');
      expect(registrantKey.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
      expect(registrantKey.type).to.equal(FieldDefinition.Type.STRING);

      // field field
      const field: any = fields.find(f => f.key === 'field');
      expect(field.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
      expect(field.type).to.equal(FieldDefinition.Type.STRING);

      // operator field
      const operator: any = fields.find(f => f.key === 'operator');
      expect(operator.optionality).to.equal(FieldDefinition.Optionality.OPTIONAL);
      expect(operator.type).to.equal(FieldDefinition.Type.STRING);

      // expectation field
      const expectation: any = fields.find(f => f.key === 'expectation');
      expect(expectation.optionality).to.equal(FieldDefinition.Optionality.OPTIONAL);
      expect(expectation.type).to.equal(FieldDefinition.Type.ANYSCALAR);
    });
  });

  describe('ExecuteStep', () => {
    describe('Expected Parameters', () => {
      it('should call getRegistrantByRegistrantKey with expected keys', async () => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'anyField',
          operator: 'be',
          expectation: 'anyValue'
        };
        
        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
          expectation: expectedRegistrant.expectation,
        }));

        clientWrapperStub.getRegistrantByRegistrantKey.returns(Promise.resolve({
          data: JSON.stringify({
            registrantKey: 'anyValue',
            joinUrl: 'https://anyDomain/join/anyWebinarKey/anyRegirantKey',
            anyField: 'anyValue'
          }),
        }));

        await stepUnderTest.executeStep(protoStep);
        expect(clientWrapperStub.getRegistrantByRegistrantKey).to.have.been.calledWith(expectedRegistrant.registrantKey, expectedRegistrant.webinarKey, expectedRegistrant.organizerKey);
      });
    });

    describe('Registrant field matches expectation', () => {
      beforeEach(() => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'anyField',
          operator: 'be',
          expectation: 'anyValue'
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
          expectation: expectedRegistrant.expectation,
        }));

        clientWrapperStub.getRegistrantByRegistrantKey.returns(Promise.resolve({
          data: JSON.stringify({
            registrantKey: 'anyValue',
            joinUrl: 'https://anyDomain/join/anyWebinarKey/anyRegirantKey',
            anyField: 'anyValue'
          }),
        }));
      });

      it('should respond with pass', async () => {
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
      });
    });

    describe('Registrant field does not match expectation', () => {
      beforeEach(() => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'anyField',
          operator: 'be',
          expectation: 'anyValue'
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
          expectation: expectedRegistrant.expectation,
        }));
        clientWrapperStub.getRegistrantByRegistrantKey.returns(Promise.resolve({
          data: JSON.stringify({
            registrantKey: 'anyValue',
            joinUrl: 'https://anyDomain/join/anyWebinarKey/anyRegirantKey',
            anyField: 'notAnyValue'
          }),
        }));
      });

      it('should respond with fail', async () => {
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
      });
    });

    describe('Registrant field does not exist on registrant', () => {
      beforeEach(() => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'otherField',
          operator: 'be',
          expectation: 'anyValue'
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
          expectation: expectedRegistrant.expectation,
        }));
        clientWrapperStub.getRegistrantByRegistrantKey.returns(Promise.resolve({
          data: JSON.stringify({
            registrantKey: 'anyValue',
            joinUrl: 'https://anyDomain/join/anyWebinarKey/anyRegirantKey',
            anyField: 'notAnyValue'
          }),
        }));
      });

      it('should respond with pass', async () => {
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
      });
    });

    describe('Error occurred', () => {
      beforeEach(() => {
        
      });

      it('should respond with error if no expecation is set but operators is be set or not be set', async () => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'anyField',
          operator: 'be',
          expectation: 'anyValue'
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
        }));

        clientWrapperStub.getRegistrantByRegistrantKey.returns(Promise.resolve({
          data: JSON.stringify({
            registrantKey: 'anyValue',
            joinUrl: 'https://anyDomain/join/anyWebinarKey/anyRegirantKey',
            anyField: 'notAnyValue'
          }),
        }));
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
      });

      it('should respond with error if unknown operator is provided', async () => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'anyField',
          operator: 'unknownOperator',
          expectation: 'anyValue'
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
          expectation: expectedRegistrant.expectation,
        }));

        clientWrapperStub.getRegistrantByRegistrantKey.returns(Promise.resolve({
          data: JSON.stringify({
            registrantKey: 'anyValue',
            joinUrl: 'https://anyDomain/join/anyWebinarKey/anyRegirantKey',
            anyField: 'notAnyValue'
          }),
        }));
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
      });

      it('should respond with error if registrant is not found', async () => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'anyField',
          operator: 'operator',
          expectation: 'anyValue',
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
          expectation: expectedRegistrant.expectation,
        }));

        clientWrapperStub.getRegistrantByRegistrantKey.throws({
          response: {
            status: 404,
            data: JSON.stringify({
              description: 'anyError'
            }),
          },
          message: 'anyError',
        });

        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
      });

      it('should respond with error', async () => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
          field: 'anyField',
          operator: 'operator',
          expectation: 'anyValue'
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
          field: expectedRegistrant.field,
          operator: expectedRegistrant.operator,
          expectation: expectedRegistrant.expectation,
        }));

        clientWrapperStub.getRegistrantByRegistrantKey.throws({
          response: {
            status: 400,
            data: JSON.stringify({
              description: 'anyError'
            }),
          },
          message: 'anyError',
        });

        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
      });
    });
  });
});
