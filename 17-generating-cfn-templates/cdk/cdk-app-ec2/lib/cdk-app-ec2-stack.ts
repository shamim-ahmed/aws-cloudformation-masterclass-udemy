import { Stack, StackProps } from 'aws-cdk-lib';
import { Vpc, SubnetType, SecurityGroup, Peer, Port, Instance, InstanceType, InstanceClass, InstanceSize, AmazonLinuxImage, AmazonLinuxGeneration } from 'aws-cdk-lib/aws-ec2';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { readFileSync } from 'fs';

export class CdkAppEc2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create VPC in which we'll launch the Instance
    const vpc = new Vpc(this, 'my-cdk-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      subnetConfiguration: [
        { name: 'public', cidrMask: 24, subnetType: SubnetType.PUBLIC },
      ],
    });

    // create Security Group for the Instance
    const webserverSG = new SecurityGroup(this, 'webserver-sg', {
      vpc,
      allowAllOutbound: true,
    });

    webserverSG.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      'allow SSH access from anywhere',
    );

    webserverSG.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      'allow HTTP traffic from anywhere',
    );

    webserverSG.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(443),
      'allow HTTPS traffic from anywhere',
    );

    // create a Role for the EC2 Instance
    const webserverRole = new Role(this, 'webserver-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ],
    });

    // create the EC2 Instance
    const ec2Instance = new Instance(this, 'ec2-instance', {
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      role: webserverRole,
      securityGroup: webserverSG,
      instanceType: InstanceType.of(
        InstanceClass.T2,
        InstanceSize.MICRO,
      ),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: 'MyEC2KeyPair',
    });

    // load contents of script
    const userDataScript = readFileSync('./lib/user-data.sh', 'utf8');
    // add the User Data script to the Instance
    ec2Instance.addUserData(userDataScript);
  }
}
