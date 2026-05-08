const { NodeSSH } = require('node-ssh');

async function main() {
  const ssh = new NodeSSH();
  await ssh.connect({
    host: '192.168.2.36',
    username: 'root',
    password: 'devvpn2026',
    readyTimeout: 10000,
  });

  // Patch the file in the VM
  const patchRes = await ssh.execCommand(
    'qm guest exec 108 -- bash -c "sed -i \\"/NEXT_PUBLIC_API_HOST/a \\      - NEXT_PUBLIC_APP_HOST=http://DNS_PLACEHOLDER\\n      - NEXT_PUBLIC_NETWORK_NAME=BlockBuilder\\n      - NEXT_PUBLIC_NETWORK_ID=CHAINID_PlACEHOLDER\\" /home/ubuntu/.containers/blockscout-*/docker-compose.yml"',
  );
  console.log('patch:', patchRes.stdout, patchRes.stderr);

  // Restart frontend container (using workaround)
  await ssh.execCommand(
    'qm guest exec 108 -- bash -c "cd /home/ubuntu/.containers/blockscout-* && docker-compose rm -f frontend"',
  );
  const upRes = await ssh.execCommand(
    'qm guest exec 108 -- bash -c "cd /home/ubuntu/.containers/blockscout-* && docker-compose up -d"',
  );
  console.log('up:', upRes.stdout, upRes.stderr);

  // Wait 10 seconds for frontend to start
  await new Promise((r) => setTimeout(r, 10000));

  // Check ps
  const psRes = await ssh.execCommand('qm guest exec 108 -- bash -c "docker ps"');
  console.log('ps:', psRes.stdout, psRes.stderr);

  ssh.dispose();
}

main().catch(console.error);
