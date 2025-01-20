import { PrismaClient } from '@saas-monorepo/database';
import { exec } from 'child_process';
import { kill } from 'process';
import { promisify } from 'util';

import { AbstractServiceOptions } from '../types/services.js';

const execAsync = promisify(exec);

export class NodesService {
  prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async buildNetwork(nodesNumber: number) {
    const NETWORK_SCRIPT_DIR = process.env.NETWORK_SCRIPT_DIR;
    if (!NETWORK_SCRIPT_DIR) {
      throw new Error('NETWORK_SCRIPT_DIR is not defined');
    }

    // Define your scripts and parameters
    // const scripts = [
    //   { script: 'network_build.sh', params: `${nodesNumber}` },
    // ];

    // const results: Array<{ script: string; success: boolean; output?: string; error?: string }> = [];

    // for (const { script, params } of scripts) {
    //   try {
    //     const command = `${NETWORK_SCRIPT_DIR}/${script} ${params}`;
    //     console.log(`Executing: ${command}`);

    //     const { stdout, stderr } = await execAsync(command, {
    //       shell: '/bin/bash',
    //     });

    //     console.log(`Output for ${script}:`, stdout);
    //     results.push({ script, success: true, output: stdout });
    //   } catch (error: any) {
    //     console.error(`Error executing ${script}:`, error);
    //     results.push({
    //       script,
    //       success: false,
    //       error: `Unexpected error: ${error.message}\nFull error: ${error}`,
    //     });
    //   }
    // }

    // return results;

    try {
      const { stdout, stderr } = await execAsync(
        `echo ${nodesNumber} | ${NETWORK_SCRIPT_DIR}/network_build.sh`,
        {
          shell: '/bin/bash',
        },
      );
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      return { success: true, output: stdout };
    } catch (error: any) {
      console.error('Full error:', error);
      return {
        success: false,
        error: `Unexpected error: ${error.message}\nFull error: ${error}`,
      };
    }
  }

  async killNetwork() {
    try {
      const NETWORK_SCRIPT_DIR = process.env.NETWORK_SCRIPT_DIR;

      const { stdout, stderr } = await execAsync(`${NETWORK_SCRIPT_DIR}/kill.sh`, {
        shell: '/bin/bash',
      });

      console.log(`Output:`, stdout);
      console.error(`Error output for:`, stderr);
    } catch (error: any) {
      console.error('Full error:', error);
      return {
        success: false,
        error: `Unexpected error: ${error.message}\nFull error: ${error}`,
      };
    }
  }
}
