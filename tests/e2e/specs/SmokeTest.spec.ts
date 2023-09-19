/** *******************************************************************
 * copyright (c) 2023 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { SideBarView, ViewItem, ViewSection } from 'monaco-page-objects';
import { ProjectAndFileTests } from '../tests-library/ProjectAndFileTests';
import { CLASSES } from '../configs/inversify.types';
import { e2eContainer } from '../configs/inversify.config';
import { WorkspaceHandlingTests } from '../tests-library/WorkspaceHandlingTests';
import { registerRunningWorkspace } from './MochaHooks';
import { Logger } from '../utils/Logger';
import { LoginTests } from '../tests-library/LoginTests';
import { StringUtil } from '../utils/StringUtil';
import { FACTORY_TEST_CONSTANTS } from '../constants/FACTORY_TEST_CONSTANTS';
import { BrowserTabsUtil } from '../utils/BrowserTabsUtil';
import { expect } from 'chai';
import { BASE_TEST_CONSTANTS } from '../constants/BASE_TEST_CONSTANTS';

suite('The SmokeTest userstory', function (): void {
	const projectAndFileTests: ProjectAndFileTests = e2eContainer.get(CLASSES.ProjectAndFileTests);
	const workspaceHandlingTests: WorkspaceHandlingTests = e2eContainer.get(CLASSES.WorkspaceHandlingTests);
	const loginTests: LoginTests = e2eContainer.get(CLASSES.LoginTests);
	const browserTabsUtil: BrowserTabsUtil = e2eContainer.get(CLASSES.BrowserTabsUtil);
	const factoryUrl: string =
		FACTORY_TEST_CONSTANTS.TS_SELENIUM_FACTORY_GIT_REPO_URL || 'https://github.com/che-incubator/quarkus-api-example.git';
	let projectSection: ViewSection;
	suite(`Create workspace from factory:${factoryUrl}`, function (): void {
		loginTests.loginIntoChe();
		test(`Create and open new workspace from factory:${factoryUrl}`, async function (): Promise<void> {
			await workspaceHandlingTests.createAndOpenWorkspaceFromGitRepository(factoryUrl);
		});
		test('Obtain workspace name from workspace loader page', async function (): Promise<void> {
			await workspaceHandlingTests.obtainWorkspaceNameFromStartingPage();
		});
		test('Register running workspace', function (): void {
			registerRunningWorkspace(WorkspaceHandlingTests.getWorkspaceName());
		});
		test('Wait workspace readiness', async function (): Promise<void> {
			await projectAndFileTests.waitWorkspaceReadinessForCheCodeEditor();
		});
		test('Check a project folder has been created', async function (): Promise<void> {
			const projectName: string = FACTORY_TEST_CONSTANTS.TS_SELENIUM_PROJECT_NAME || StringUtil.getProjectNameFromGitUrl(factoryUrl);
			projectSection = (await new SideBarView().getContent().getSections())[0]; // get the (WORKSPACE) section from the sidebar - contains project content
			expect(false).to.be.true;
			expect(await projectSection.findItem(projectName)).not.eqls(undefined);
		});
		test('Check the project files was imported', async function (): Promise<void> {
			Logger.debug(`projectSection.findItem: find ${BASE_TEST_CONSTANTS.TS_SELENIUM_PROJECT_ROOT_FILE_NAME}`);
			const isFileImported: ViewItem | undefined = await projectSection.findItem(
				BASE_TEST_CONSTANTS.TS_SELENIUM_PROJECT_ROOT_FILE_NAME
			);
			expect(isFileImported).not.eqls(undefined);
		});
		test('Stop the workspace', async function (): Promise<void> {
			await workspaceHandlingTests.stopWorkspace(WorkspaceHandlingTests.getWorkspaceName());
			await browserTabsUtil.closeAllTabsExceptCurrent();
		});
		test('Delete the workspace', async function (): Promise<void> {
			await workspaceHandlingTests.removeWorkspace(WorkspaceHandlingTests.getWorkspaceName());
		});
		loginTests.logoutFromChe();
	});
});
