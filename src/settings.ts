import { App, PluginSettingTab, Setting } from "obsidian";
import type TextMapperPlugin from "./main";

export interface TextMapperSettings {
    saveLocation: string;
    defaultTheme: "gnomeyland" | "apocalypse" | "tag-and-tally";
}

export const DEFAULT_SETTINGS: TextMapperSettings = {
    saveLocation: "_saved-maps",
    defaultTheme: "tag-and-tally",
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

        new Setting(containerEl)
            .setName("Default theme")
            .setDesc("Default theme to use for maps. Can be overridden per-map with 'option theme <name>'.")
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("gnomeyland", "Gnomeyland")
                    .addOption("apocalypse", "Apocalypse")
                    .addOption("tag-and-tally", "Tag and Tally")
                    .setValue(this.plugin.settings.defaultTheme)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultTheme = value as "gnomeyland" | "apocalypse" | "tag-and-tally";
                        await this.plugin.saveSettings();
                        // Refresh all active mappers that don't have a theme override
                        this.plugin.refreshAllMappers();
                    })
            );
    }
}
