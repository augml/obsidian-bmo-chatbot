import { Setting, SettingTab } from "obsidian";
import BMOGPT, { DEFAULT_SETTINGS } from "src/main";

export function addChatHistorySettings(containerEl: HTMLElement, plugin: BMOGPT, SettingTab: SettingTab) {
    containerEl.createEl('h2', {text: 'Chat History'});

    new Setting(containerEl)
        .setName('Chat History Folder Path')
        .setDesc('Save your chat history in a specified folder.')
        .addText(text => text
            .setPlaceholder('BMO/')
            .setValue(plugin.settings.chatHistoryPath || DEFAULT_SETTINGS.chatHistoryPath)
            .onChange(async (value) => {
                plugin.settings.chatHistoryPath = value ? value : DEFAULT_SETTINGS.chatHistoryPath;
                await plugin.saveSettings();
            })
        );

    new Setting(containerEl)
        .setName('Template File Path')
        .setDesc('Insert your template file path.')
        .addText(text => text
            .setPlaceholder('templates/bmo.md')
            .setValue(plugin.settings.templateFilePath || DEFAULT_SETTINGS.templateFilePath)
            .onChange(async (value) => {
                plugin.settings.templateFilePath = value ? value : DEFAULT_SETTINGS.templateFilePath;
                if (value) {
                    // Check if the provided file path ends with '.md', if not, append it
                    if (!plugin.settings.templateFilePath.endsWith('.md')) {
                        plugin.settings.templateFilePath += '.md';
                    }

                    await plugin.saveSettings();

                    const allFiles = app.vault.getFiles(); // Retrieve all files from the vault

                    // Check if the specified file path (including directories) exists in the array of files
                    const fileExists = allFiles.some(file => 
                        file.path.toLowerCase() === plugin.settings.templateFilePath.toLowerCase());
                        
                    if (fileExists) {
                        // console.log("File exists in vault!");
                        text.inputEl.style.borderColor = "";
                    } else {
                        // console.log("File does not exist in vault.");
                        text.inputEl.style.borderColor = "red";
                    }
                } else {
                    // If the input is empty, reset the border color
                    text.inputEl.style.borderColor = "";
                    plugin.settings.templateFilePath = DEFAULT_SETTINGS.templateFilePath;
                }
            })
        );

    new Setting(containerEl)
        .setName('Allow Rename Note Title')
        .setDesc('Allow model to rename the note title when saving chat history.')
        .addToggle((toggle) =>
            toggle.setValue(plugin.settings.allowRenameNoteTitle).onChange((value) => {
                plugin.settings.allowRenameNoteTitle = value;
                plugin.saveSettings();
            })
        );
}