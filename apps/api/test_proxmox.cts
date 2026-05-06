import { NodeSSH } from 'node-ssh';

async function main() {
  const ssh = new NodeSSH();
  await ssh.connect({
    host: '192.168.2.36',
    username: 'root',
    password: 'devvpn2026',
    readyTimeout: 10000,
  });

  const res = await ssh.execCommand('qm guest exec 106 -- bash -c "docker ps -a"');
  // qm guest exec returns JSON output
  console.log(res.stdout);

  ssh.dispose();
}

main().catch(console.error);
