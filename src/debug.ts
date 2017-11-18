import * as extension from "./extension";
import * as utils from "./utils";
import { basename } from "path";
import * as vscode from "vscode";

import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';

/**
 * Gets stringified settings to pass to the debug server.
 */
export async function getDebugSettings() {
    return JSON.stringify({ env: extension.env });
}

/**
 * Interacts with the user to create initial configurations.
 */
export async function provideInitialConfigurations(config: DebugConfiguration) {
    const packages = utils.getPackages();

    const command = await vscode.window.showQuickPick(["roslaunch", "rosrun"], { placeHolder: "Launch command" });
    const packageName = await vscode.window.showQuickPick(packages.then(Object.keys), { placeHolder: "Package" });

    let target: string;

    if (packageName) {
        let basenames = (files: string[]) => files.map(file => basename(file));

        if (command === "roslaunch") {
            const launches = utils.findPackageLaunchFiles(packageName).then(basenames);
            target = await vscode.window.showQuickPick(launches, { placeHolder: "Launch file" });
        } else {
            const executables = utils.findPackageExecutables(packageName).then(basenames);
            target = await vscode.window.showQuickPick(executables, { placeHolder: "Executable" });
        }
    } else {
        target = await vscode.window.showInputBox({ placeHolder: "Target" });
    }

    config.name = target;
    config.type = "ros";
    config.debugSettings = "${command:debugSettings}";
    config.package = packageName;
    config.target = target;
    config.command = command;

}
