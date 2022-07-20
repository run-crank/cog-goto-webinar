import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/registrant/registrant-delete';

chai.use(sinonChai);

describe('DeleteRegistrantStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let clientWrapperStub: any;

  beforeEach(() => {
    protoStep = new ProtoStep();
    clientWrapperStub = sinon.stub();
    clientWrapperStub.deleteRegistrant = sinon.stub();
    stepUnderTest = new Step(clientWrapperStub);
  });

  describe('Metadata', () => {
    it('should return expected step metadata', () => {
      const stepDef: StepDefinition = stepUnderTest.getDefinition();
      expect(stepDef.getStepId()).to.equal('DeleteRegistrantStep');
      expect(stepDef.getName()).to.equal('Delete a GoTo Webinar Registrant');
      expect(stepDef.getExpression()).to.equal('delete a goto webinar registrant');
      expect(stepDef.getType()).to.equal(StepDefinition.Type.ACTION);
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
    });
  });

  describe('ExecuteStep', () => {
    describe('Expected Parameters', () => {
      it('should call deleteRegistrant with expected keys', async () => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
        };
        
        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
        }));

        await stepUnderTest.executeStep(protoStep);
        expect(clientWrapperStub.deleteRegistrant).to.have.been.calledWith(expectedRegistrant.registrantKey, expectedRegistrant.webinarKey, expectedRegistrant.organizerKey);
      });
    });

    describe('Registrant successfully deleted', () => {
      beforeEach(() => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
        }));
        clientWrapperStub.deleteRegistrant.returns(Promise.resolve({
          data: {
            registrantKey: 'anyValue',
            joinUrl: 'anyValue',
          }
        }));
      });

      it('should respond with pass', async () => {
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
      });
    });

    describe('Error occurred', () => {
      beforeEach(() => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrantKey: 'anyKey',
        };

        protoStep.setData(Struct.fromJavaScript({
          organizerKey: expectedRegistrant.organizerKey,
          webinarKey: expectedRegistrant.webinarKey,
          registrantKey: expectedRegistrant.registrantKey,
        }));

        clientWrapperStub.deleteRegistrant.throws({
          response: {
            status: 400,
          }
        });
      });

      it('should respond with error', async () => {
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
      });
    });
  });
});
