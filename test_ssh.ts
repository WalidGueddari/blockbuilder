import fs from 'fs';
import { NodeSSH } from 'node-ssh';
import path from 'path';

async function main() {
  const ssh = new NodeSSH();
  const host = '192.168.2.118';
  // Check the DB for the exact key, but let's assume it's in the standard SSH_KEY_DIR
  // In development, the keys might be in .containers/ssh_keys or similar
  // Let's first read .env.development to find SSH_KEY_DIR
  const envFile = fs
    .readFileSync(path.join(__dirname, 'apps/api/.env.development'), 'utf8')
    .split('\n');
  let keyDir = '';
  for (const line of envFile) {
    if (line.startsWith('SSH_KEY_DIR=')) {
      keyDir = line.split('=')[1]!.trim();
      break;
    }
  }
  if (!keyDir) {
    // try to guess
    keyDir = path.join(__dirname, '.containers/keys');
  }

  // Try to find the key for 192.168.2.118 or just try all keys in the directory
  const files = fs.readdirSync(keyDir);
  let connected = false;

  for (const file of files) {
    if (file.endsWith('.pub')) continue;

    console.log('Trying key:', file);
    try {
      await ssh.connect({
        host,
        username: 'ubuntu', // Or whatever user
        privateKey: fs.readFileSync(path.join(keyDir, file), 'utf8'),
        readyTimeout: 5000,
      });
      console.log('Connected with key:', file);
      connected = true;
      break;
    } catch (err) {
      // ignore
    }
  }

  if (!connected) {
    console.log('Failed to connect via SSH');
    return;
  }

  console.log('--- docker ps ---');
  let res = await ssh.execCommand('sudo docker ps -a');
  console.log(res.stdout);

  console.log('--- Nginx Status ---');
  res = await ssh.execCommand('sudo systemctl status nginx');
  console.log(res.stdout);

  ssh.dispose();
}

main().catch(console.error);
