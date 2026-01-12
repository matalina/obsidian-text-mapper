import { App, PluginSettingTab, Setting } from "obsidian";
import type TextMapperPlugin from "./main";

export interface TextMapperSettings {
    saveLocation: string;
}

export const DEFAULT_SETTINGS: TextMapperSettings = {
    saveLocation: "_saved-maps",
};

export class TextMapperSettingTab extends PluginSettingTab {
    plugin: TextMapperPlugin;

    constructor(app: App, plugin: TextMapperPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", { text: "Text Mapper Settings" });

        new Setting(containerEl)
            .setName("Save location")
            .setDesc("Folder path where PNG exports will be saved (default: _saved-maps). Use an empty string to save in the same folder as the current note.")
            .addText((text) =>
                text
                    .setPlaceholder("_saved-maps")
                    .setValue(this.plugin.settings.saveLocation)
                    .onChange(async (value) => {
                        // Normalize the path: remove leading/trailing slashes, but keep internal structure
                        const normalized = value.trim().replace(/^\/+|\/+$/g, "");
                        this.plugin.settings.saveLocation = normalized;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
