import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export class CdkAppDynamodbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Table(this, 'AwsCdkDemoTable', {
      tableName: 'my_records',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      removalPolicy: RemovalPolicy.DESTROY
    })
  }
}
