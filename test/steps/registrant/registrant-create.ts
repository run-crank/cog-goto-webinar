import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/registrant/registrant-create';

chai.use(sinonChai);

describe('CreateProductStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let clientWrapperStub: any;

  beforeEach(() => {
    protoStep = new ProtoStep();
    clientWrapperStub = sinon.stub();
    clientWrapperStub.createRegistrant = sinon.stub();
    stepUnderTest = new Step(clientWrapperStub);
  });

  describe('Metadata', () => {
    it('should return expected step metadata', () => {
      const stepDef: StepDefinition = stepUnderTest.getDefinition();
      expect(stepDef.getStepId()).to.equal('CreateRegistrantStep');
      expect(stepDef.getName()).to.equal('Create a GoTo Webinar Registrant');
      expect(stepDef.getExpression()).to.equal('create a goto webinar registrant');
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

      // registrant field
      const registrant: any = fields.find(f => f.key === 'registrant');
      expect(registrant.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
      expect(registrant.type).to.equal(FieldDefinition.Type.MAP);
    });
  });

  describe('ExecuteStep', () => {
    describe('Expected Parameters', () => {
      it('should call createProduct with expected objectId and registrant', async () => {
        const expectedRegistrant = {
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrant: {
            anyKey: 'anyValue'
          }
        };
        
        protoStep.setData(Struct.fromJavaScript({
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrant: {
            anyKey: 'anyValue'
          }
        }));

        await stepUnderTest.executeStep(protoStep);
        expect(clientWrapperStub.createRegistrant).to.have.been.calledWith(expectedRegistrant.registrant, expectedRegistrant.webinarKey, expectedRegistrant.organizerKey);
      });
    });

    describe('Registrant successfully created', () => {
      beforeEach(() => {
        protoStep.setData(Struct.fromJavaScript({
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrant: {
            anyKey: 'anyValue'
          }
        }));
        clientWrapperStub.createRegistrant.returns(Promise.resolve({
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
        protoStep.setData(Struct.fromJavaScript({
          organizerKey: 'anyKey',
          webinarKey: 'anyKey',
          registrant: {
            anyKey: 'anyValue'
          }
        }));
        clientWrapperStub.createRegistrant.returns(Promise.reject('Error'));
      });

      it('should respond with error', async () => {
        const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
      });
    });
  });
});
