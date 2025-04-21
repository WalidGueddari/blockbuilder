import fs from 'fs';
import { artifacts, ethers, run } from 'hardhat';
import path from 'path';
import readline from 'readline';

type ConstructorInput = {
  name: string;
  type: string;
};

async function promptUserInputs(inputs: ConstructorInput[]): Promise<any[]> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const responses: any[] = [];
  for (const input of inputs) {
    const answer = await new Promise<string>((resolve) =>
      rl.question(`Enter value for constructor param "${input.name}" (${input.type}): `, resolve),
    );
    responses.push(parseTypedInput(answer, input.type));
  }

  rl.close();
  return responses;
}

function parseTypedInput(value: string, type: string): any {
  if (type.startsWith('uint') || type === 'int') return parseInt(value);
  if (type === 'bool') return value === 'true';
  return value;
}

async function main() {
  const contractsPath = path.join(__dirname, '..', 'contracts');

  const files = fs
    .readdirSync(contractsPath)
    .filter((f) => f.endsWith('.sol'))
    .map((f) => ({
      file: f,
      fullPath: path.join(contractsPath, f),
      mtime: fs.statSync(path.join(contractsPath, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.error('❌ No Solidity contracts found.');
    process.exit(1);
  }

  const latestFile = files[0];
  const source = fs.readFileSync(latestFile.fullPath, 'utf8');

  const match = source.match(/contract\s+(\w+)/);
  if (!match) {
    console.error(`❌ Could not detect contract in ${latestFile.file}`);
    process.exit(1);
  }

  const contractName = match[1];
  const fullyQualifiedName = `contracts/${latestFile.file}:${contractName}`;
  console.log(`🧠 Detected contract: ${contractName} (${fullyQualifiedName})`);

  await run('compile');

  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying as: ${deployer.address}`);
  console.log(`💰 Balance: ${(await deployer.provider.getBalance(deployer.address)).toString()}`);

  const artifact = await artifacts.readArtifact(fullyQualifiedName);
  const constructorInputs = artifact.abi.find((f: any) => f.type === 'constructor')?.inputs || [];

  let constructorArgs: any[] = [];
  if (constructorInputs.length > 0) {
    console.log('🛠️ Constructor args required:');
    constructorArgs = await promptUserInputs(constructorInputs);
  }

  // ✅ Correct way to deploy with full artifact
  const factory = await ethers.getContractFactoryFromArtifact(artifact);
  const contract = await factory.deploy(...constructorArgs);

  console.log('⏳ Waiting for deployment...');
  await contract.waitForDeployment();

  console.log(`✅ ${contractName} deployed at: ${await contract.getAddress()}`);
  const deployedAddress = await contract.getAddress();
  saveDeployment(deployedAddress, fullyQualifiedName, contractName);
  console.log(`✅ saved on deployments.json`);
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
});

function saveDeployment(address: string, artifactPath: string, contractName: string) {
  const deploymentsPath = path.join(__dirname, 'deployments.json');

  if (!fs.existsSync(deploymentsPath)) {
    fs.writeFileSync(deploymentsPath, '{}');
  }

  let data: Record<string, any> = {};
  const raw = fs.readFileSync(deploymentsPath, 'utf8').trim();
  if (raw.length > 0) {
    data = JSON.parse(raw);
  }

  data[address.toLowerCase()] = {
    contract: contractName,
    artifact: artifactPath,
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(data, null, 2));
  console.log('📝 Saved deployment info to deployments.json');
}
