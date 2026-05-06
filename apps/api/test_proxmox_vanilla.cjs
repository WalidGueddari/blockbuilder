const { NodeSSH } = require('node-ssh');

async function main() {
  const ssh = new NodeSSH();
  await ssh.connect({
    host: '192.168.2.36',
    username: 'root',
    password: 'devvpn2026',
    readyTimeout: 10000,
  });

  const res = await ssh.execCommand(
    'qm guest exec 106 -- bash -c "docker pull ghcr.io/blockscout/blockscout:6.8.0"',
  );
  console.log('6.8.0:', res.stdout, res.stderr);

  const res2 = await ssh.execCommand(
    'qm guest exec 106 -- bash -c "docker pull ghcr.io/blockscout/blockscout:v6.8.0-with-old-ui"',
  );
  console.log('6.8.0-old:', res2.stdout, res2.stderr);

  const res3 = await ssh.execCommand(
    'qm guest exec 106 -- bash -c "docker pull ghcr.io/blockscout/blockscout:v6.7.0"',
  );
  console.log('6.7.0:', res3.stdout, res3.stderr);

  ssh.dispose();
}

main().catch(console.error);
