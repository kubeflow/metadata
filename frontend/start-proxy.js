const {promisify} = require('util');
const child_process = require('child_process');

const exec = promisify(child_process.exec);
const spawn = child_process.spawn;

const NAMESPACE = process.env['NAMESPACE'] ? process.env['NAMESPACE'] : 'kubeflow';
const KUBECTL = 'kubectl';

console.log(`
===============================================================================
This script helps set up a dev env for client side UI only. It uses a real KF deployment for api requests.

What this does:
1. It detects metadata ui pod name in a KF deployment.
2. Port forward metadata ui pod to localhost:8080 (Metadata UI dev env is configured to redirect all api requests to localhost:8080)
===============================================================================
`);

const detectMetadataUiPodName = async () => {
  console.log('Detecting metadata ui pod name...');

  const args = [
    'get',
    'pods',
    `-n ${NAMESPACE}`,
    `-l app=metadata-ui`,
    `-o=custom-columns=:.metadata.name`,
    `--no-headers`
  ];

  const command = `${KUBECTL} ${args.join(' ')}`;

  const {stdout, stderr} = await exec(command);

  if (stderr.length > 0) {
    console.log(`Error running kubectl:`);
    console.log(`Command: ${command}`);
    console.log(`Error: ${stderr}`);
  }

  if (stdout.length === 0) {
    console.log(`
Couldn't get metadata-ui pod in namespace '$NAMESPACE', double check the cluster your kubectl talks to and your namespace is correct.
Namespace can be configured by setting env variable NAMESPACE. e.g. '$ NAMESPACE=kfm npm run start:proxy'
`);
    process.exit(1);
  }

  const podName = stdout.trim();
  console.log(`Metadata UI pod is ${podName}`);

  return podName
};

const portForwardToMetadataUiPod = async (podName) => {
  console.log('Starting to port forward frontend server in a KF deployment to respond to apis...');

  const args = [
    'port-forward',
    `-n`,
    `${NAMESPACE}`,
    podName,
    '8080:3000'
  ];

  const logBuffer = (data) => {
    console.log(data.toString().trim());
  };

  const proxyProcess = spawn(KUBECTL, args);
  proxyProcess.stdout.on('data', logBuffer);
  proxyProcess.stderr.on('data', logBuffer);
  proxyProcess.on('close', code => {
    console.log(`Metadata UI port forwarding process exited with code ${code}.`)
  });
};

detectMetadataUiPodName()
    .then(podName => portForwardToMetadataUiPod(podName))
    .catch((reason => {
      console.log(reason);
    }));