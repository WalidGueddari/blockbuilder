const { NodeSSH } = require('node-ssh');

async function main() {
  const ssh = new NodeSSH();
  await ssh.connect({
    host: '192.168.2.36',
    username: 'root',
    password: 'devvpn2026',
    readyTimeout: 10000,
  });

  // Find the blockscout VM ID (usually the newest one, let's just get the list)
  const vmsRes = await ssh.execCommand('qm list');
  const lines = vmsRes.stdout.split('\n');
  let vmId = '';
  for (const line of lines) {
    if (line.includes('blockscout') && line.includes('running')) {
      // get the ID (first column)
      vmId = line.trim().split(/\s+/)[0];
      // Keep going to get the latest one just in case there are multiple
    }
  }

  if (!vmId) {
    console.log('No running blockscout VM found. Output:');
    console.log(vmsRes.stdout);
    return;
  }

  console.log(`Using VM ID: ${vmId}`);

  // Check docker ps
  const psRes = await ssh.execCommand(`qm guest exec ${vmId} -- bash -c "docker ps -a"`);
  console.log('--- docker ps ---');
  console.log(psRes.stdout);

  // Get logs for frontend
  const frontLogs = await ssh.execCommand(
    `qm guest exec ${vmId} -- bash -c "docker logs \\$(docker ps -aq --filter name=frontend)"`,
  );
  console.log('--- frontend logs ---');
  console.log(frontLogs.stdout || frontLogs.stderr);

  // Get logs for backend
  const backLogs = await ssh.execCommand(
    `qm guest exec ${vmId} -- bash -c "docker logs \\$(docker ps -aq --filter name=blockscout-)"`,
  );
  console.log('--- backend logs ---');
  // Might be too long, let's just get the last 50 lines
  const backLogsTail = await ssh.execCommand(
    `qm guest exec ${vmId} -- bash -c "docker logs --tail 50 \\$(docker ps -aq --filter name=blockscout- | head -n 1)"`,
  );
  console.log(backLogsTail.stdout || backLogsTail.stderr);

  ssh.dispose();
}

main().catch(console.error);
