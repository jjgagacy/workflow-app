import { of } from 'rxjs';
import { describe, it, expect, jest } from '@jest/globals';
import { PluginInstallerService } from '../../src/ai/plugin/services/plugin-installer.service';

describe('PluginInstallerService', () => {
  it('treats missing taskId as success', async () => {
    const baseClient = {
      requestWithPluginDaemonResponse: jest.fn(),
    } as any;

    const service = new PluginInstallerService(baseClient);

    await expect(service.checkPluginInstallationTask('tenant-1', '')).resolves.toEqual({
      success: true,
      taskInstallations: null,
    });
  });

  it('treats status success as success', async () => {
    const baseClient = {
      requestWithPluginDaemonResponse: jest.fn().mockReturnValue(of({ status: 'success' })),
    } as any;

    const service = new PluginInstallerService(baseClient);

    await expect(service.checkPluginInstallationTask('tenant-1', 'task-1')).resolves.toEqual({
      success: true,
      taskInstallations: { status: 'success' },
    });
  });
});
