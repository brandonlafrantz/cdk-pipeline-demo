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
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          'brandonlafrantz/cdk-pipeline-demo',
          'main'
        ),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    pipeline.addStage(
      new CdkpipelinesDemoStage(this, 'PreProd', {
        env: {
          account: 'arn:aws:iam::013935887008:user/account1',
          region: 'us-west-2',
        },
      })
    );
  }
}
