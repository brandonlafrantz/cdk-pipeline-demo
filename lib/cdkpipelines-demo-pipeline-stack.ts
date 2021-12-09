import { Construct, StackProps, Stack, SecretValue } from '@aws-cdk/core';
import { CdkpipelinesDemoStage } from './cdkpipelines-demo-stage';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from '@aws-cdk/pipelines';

export class CdkpipelinesDemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyServicePipeline',
      crossAccountKeys: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          'brandonlafrantz/cdk-pipeline-demo',
          'main'
        ),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    const preprod = new CdkpipelinesDemoStage(this, 'PreProd', {
      env: {
        account: '013935887008',
        region: 'us-west-2',
      },
    });

    const preprodStage = pipeline.addStage(preprod, {
      post: [
        new ShellStep('TestService', {
          commands: ['curl -Ssf $ENDPOINT_URL'],
          envFromCfnOutputs: {
            ENDPOINT_URL: preprod.urlOutput,
          },
        }),
      ],
    });

    pipeline.addStage(
      new CdkpipelinesDemoStage(this, 'Prod', {
        env: { account: '013935887008', region: 'us-west-1' },
      })
    );
  }
}
