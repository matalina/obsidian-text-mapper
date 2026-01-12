import {
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    Menu,
    Notice,
    Plugin,
} from "obsidian";
import { APOCALYPSE } from "./apocalypse";
import { ParseError } from "./error";
import { GNOMEYLAND } from "./gnomeyland";
import { TextMapperParser } from "./parser";
import { TAG_AND_TALLY } from "./tag-and-tally";
import { OPTION_REGEX } from "./constants";
import {
    DEFAULT_SETTINGS,
    TextMapperSettings,
    TextMapperSettingTab,
} from "./settings";

export default class TextMapperPlugin extends Plugin {
    settings: TextMapperSettings;
    private activeMappers: Set<TextMapper> = new Set();

    async onload() {
        console.log("Loading Obsidian TextMapper.");
        
        await this.loadSettings();

        this.addSettingTab(new TextMapperSettingTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor(
            "text-mapper",
            this.processMarkdown.bind(this)
        );
    }

    registerMapper(mapper: TextMapper) {
        this.activeMappers.add(mapper);
    }

    unregisterMapper(mapper: TextMapper) {
        this.activeMappers.delete(mapper);
    }

    refreshAllMappers() {
        for (const mapper of this.activeMappers) {
            mapper.refresh();
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async processMarkdown(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): Promise<any> {
        try {
            const mapper = new TextMapper(el, ctx.docId, source, this);
            ctx.addChild(mapper);
            this.registerMapper(mapper);
        } catch (e) {
            console.log("text mapper error", e);
            ctx.addChild(new ParseError(el));
        }
    }

    onunload() {}
}

/**
 * Extract theme option from source code if present
 * @param source The map source code
 * @returns Theme name if found, null otherwise
 */
function getThemeFromSource(source: string): string | null {
    const lines = source.split("\n");
    for (const line of lines) {
        if (line.startsWith("#")) {
            continue;
        }
        if (OPTION_REGEX.test(line)) {
            const match = line.match(OPTION_REGEX);
            if (match) {
                const optionStr = match[1].trim();
                const tokens = optionStr.split(" ");
                if (tokens.length >= 2 && tokens[0] === "theme") {
                    return tokens[1].toLowerCase();
                }
            }
        }
    }
    return null;
}

/**
 * Extract zoom option from source code if present
 * @param source The map source code
 * @returns Zoom value if found, null otherwise
 */
function getZoomFromSource(source: string): number | null {
    const lines = source.split("\n");
    for (const line of lines) {
        if (line.startsWith("#")) {
            continue;
        }
        if (OPTION_REGEX.test(line)) {
            const match = line.match(OPTION_REGEX);
            if (match) {
                const optionStr = match[1].trim();
                const tokens = optionStr.split(" ");
                if (tokens.length >= 2 && tokens[0] === "zoom") {
                    const zoomValue = parseFloat(tokens[1]);
                    if (!isNaN(zoomValue) && zoomValue > 0) {
                        return zoomValue;
                    }
                }
            }
        }
    }
    return null;
}

/**
 * Get the theme constant string based on theme name
 * @param themeName The theme name (gnomeyland, apocalypse, or tag-and-tally)
 * @returns The theme constant string
 */
function getThemeConstant(themeName: string): string {
    switch (themeName.toLowerCase()) {
        case "gnomeyland":
            return GNOMEYLAND;
        case "apocalypse":
            return APOCALYPSE;
        case "tag-and-tally":
        default:
            return TAG_AND_TALLY;
    }
}

export class TextMapper extends MarkdownRenderChild {
    textMapperEl: HTMLDivElement;
    svgEl: SVGElement | null = null;
    svgDomElement: SVGSVGElement | null = null;
    parser: TextMapperParser | null = null;
    plugin: Plugin;
    private source: string;
    private docId: string;
    
    // Pan and zoom state
    panX: number = 0;
    panY: number = 0;
    zoom: number = 1.0;
    isDragging: boolean = false;
    dragStartX: number = 0;
    dragStartY: number = 0;
    dragStartPanX: number = 0;
    dragStartPanY: number = 0;
    
    // Touch state
    touchStartX: number = 0;
    touchStartY: number = 0;
    touchStartPanX: number = 0;
    touchStartPanY: number = 0;
    
    // Content bounds for pan limits
    contentBounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null;
    
    // Fixed viewBox dimensions
    fixedViewBoxWidth: number = 800;
    fixedViewBoxHeight: number = 600;
    
    // Zoom limits
    minZoom: number = 0.5;
    maxZoom: number = 4.0;

    constructor(containerEl: HTMLElement, docId: string, source: string, plugin: Plugin) {
        super(containerEl);
        this.plugin = plugin;
        this.source = source;
        this.docId = docId;
        this.textMapperEl = this.containerEl.createDiv({ cls: "textmapper" });

        this.render();
        
        // Register with plugin
        if (plugin instanceof TextMapperPlugin) {
            plugin.registerMapper(this);
        }
    }

    onunload() {
        // Unregister from plugin
        if (this.plugin instanceof TextMapperPlugin) {
            this.plugin.unregisterMapper(this);
        }
        super.onunload();
    }

    refresh() {
        // Only refresh if this mapper doesn't have a theme override in source
        // (mappers with theme override shouldn't change when default changes)
        const themeFromSource = getThemeFromSource(this.source);
        if (!themeFromSource) {
            // Reset pan and zoom state
            this.panX = 0;
            this.panY = 0;
            this.zoom = 1.0;
            this.isDragging = false;
            
            this.textMapperEl.empty();
            this.render();
        }
    }

    private render() {
        // Determine which theme to use
        const themeFromSource = getThemeFromSource(this.source);
        const themeName = themeFromSource || (this.plugin as TextMapperPlugin).settings.defaultTheme;
        const themeConstant = getThemeConstant(themeName);

        const totalSource = themeConstant.split("\n")
            .concat(this.source.split("\n"));

        this.parser = new TextMapperParser(this.docId);
        this.parser.process(totalSource);
        this.svgEl = this.parser.svg(this.textMapperEl);
        
        // Get the actual DOM element
        this.svgDomElement = this.textMapperEl.querySelector("svg") as SVGSVGElement;
        
        // Get content bounds for pan limits
        this.contentBounds = this.parser.getContentBounds();
        
        // Extract and apply zoom option from source
        const zoomFromSource = getZoomFromSource(this.source);
        if (zoomFromSource !== null) {
            // Apply zoom, respecting min/max limits
            this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoomFromSource));
        }
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Set initial cursor style and update viewBox
        if (this.svgDomElement) {
            this.svgDomElement.style.cursor = "grab";
            // Ensure initial viewBox is set correctly with the configured zoom
            this.updateViewBox();
        }
    }
    
    setupEventHandlers() {
        if (!this.svgDomElement) return;
        
        const svgElement = this.svgDomElement;
        
        // Mouse events for panning
        svgElement.addEventListener("mousedown", this.handleMouseDown.bind(this));
        svgElement.addEventListener("mousemove", this.handleMouseMove.bind(this));
        svgElement.addEventListener("mouseup", this.handleMouseUp.bind(this));
        svgElement.addEventListener("mouseleave", this.handleMouseUp.bind(this));
        
        // Touch events for mobile panning
        svgElement.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
        svgElement.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
        svgElement.addEventListener("touchend", this.handleTouchEnd.bind(this));
        
        // Wheel event for zooming
        svgElement.addEventListener("wheel", this.handleWheel.bind(this), { passive: false });
        
        // Context menu event for save option
        svgElement.addEventListener("contextmenu", this.handleContextMenu.bind(this));
    }
    
    handleMouseDown(e: MouseEvent) {
        if (e.button !== 0 || !this.svgDomElement) return; // Only handle left mouse button
        
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragStartPanX = this.panX;
        this.dragStartPanY = this.panY;
        
        this.svgDomElement.style.cursor = "grabbing";
    }
    
    handleMouseMove(e: MouseEvent) {
        if (!this.isDragging || !this.svgDomElement) return;
        
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Convert screen delta to SVG coordinate delta
        const rect = this.svgDomElement.getBoundingClientRect();
        const svgDeltaX = (deltaX / rect.width) * (this.fixedViewBoxWidth / this.zoom);
        const svgDeltaY = (deltaY / rect.height) * (this.fixedViewBoxHeight / this.zoom);
        
        this.panX = this.dragStartPanX - svgDeltaX;
        this.panY = this.dragStartPanY - svgDeltaY;
        
        this.applyPanLimits();
        this.updateViewBox();
    }
    
    handleMouseUp(e: MouseEvent) {
        if (!this.isDragging || !this.svgDomElement) return;
        
        this.isDragging = false;
        this.svgDomElement.style.cursor = "grab";
    }
    
    handleTouchStart(e: TouchEvent) {
        if (e.touches.length !== 1 || !this.svgDomElement) return; // Only handle single touch for now
        
        e.preventDefault();
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartPanX = this.panX;
        this.touchStartPanY = this.panY;
    }
    
    handleTouchMove(e: TouchEvent) {
        if (e.touches.length !== 1 || !this.svgDomElement) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        // Convert screen delta to SVG coordinate delta
        const rect = this.svgDomElement.getBoundingClientRect();
        const svgDeltaX = (deltaX / rect.width) * (this.fixedViewBoxWidth / this.zoom);
        const svgDeltaY = (deltaY / rect.height) * (this.fixedViewBoxHeight / this.zoom);
        
        this.panX = this.touchStartPanX - svgDeltaX;
        this.panY = this.touchStartPanY - svgDeltaY;
        
        this.applyPanLimits();
        this.updateViewBox();
    }
    
    handleTouchEnd(e: TouchEvent) {
        // Touch ended, nothing to do
    }
    
    handleWheel(e: WheelEvent) {
        e.preventDefault();
        
        if (!this.svgDomElement) return;
        
        const rect = this.svgDomElement.getBoundingClientRect();
        
        // Get mouse position relative to SVG
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert to SVG coordinates (before zoom)
        const svgX = (mouseX / rect.width) * (this.fixedViewBoxWidth / this.zoom) + (this.getViewBoxX());
        const svgY = (mouseY / rect.height) * (this.fixedViewBoxHeight / this.zoom) + (this.getViewBoxY());
        
        // Calculate zoom delta
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomDelta));
        
        if (newZoom === this.zoom) return; // Zoom limit reached
        
        // Calculate new pan to keep the point under mouse cursor in the same place
        const newViewBoxWidth = this.fixedViewBoxWidth / newZoom;
        const newViewBoxHeight = this.fixedViewBoxHeight / newZoom;
        
        const newViewBoxX = svgX - (mouseX / rect.width) * newViewBoxWidth;
        const newViewBoxY = svgY - (mouseY / rect.height) * newViewBoxHeight;
        
        // Update zoom and pan
        this.zoom = newZoom;
        const initialCenter = this.parser!.getInitialCenter();
        this.panX = newViewBoxX - (initialCenter.x - newViewBoxWidth / 2);
        this.panY = newViewBoxY - (initialCenter.y - newViewBoxHeight / 2);
        
        this.applyPanLimits();
        this.updateViewBox();
    }
    
    getViewBoxX(): number {
        const initialCenter = this.parser!.getInitialCenter();
        const viewBoxWidth = this.fixedViewBoxWidth / this.zoom;
        return initialCenter.x - viewBoxWidth / 2 + this.panX;
    }
    
    getViewBoxY(): number {
        const initialCenter = this.parser!.getInitialCenter();
        const viewBoxHeight = this.fixedViewBoxHeight / this.zoom;
        return initialCenter.y - viewBoxHeight / 2 + this.panY;
    }
    
    applyPanLimits() {
        if (!this.contentBounds) return;
        
        const viewBoxWidth = this.fixedViewBoxWidth / this.zoom;
        const viewBoxHeight = this.fixedViewBoxHeight / this.zoom;
        const initialCenter = this.parser!.getInitialCenter();
        
        // Calculate limits based on viewBox boundaries
        // viewBoxX = initialCenter.x - viewBoxWidth/2 + panX
        // We need: viewBoxX >= contentBounds.minX and viewBoxX + viewBoxWidth <= contentBounds.maxX
        const minPanX = this.contentBounds.minX - initialCenter.x + viewBoxWidth / 2;
        const maxPanX = this.contentBounds.maxX - initialCenter.x - viewBoxWidth / 2;
        
        // Similar for Y
        const minPanY = this.contentBounds.minY - initialCenter.y + viewBoxHeight / 2;
        const maxPanY = this.contentBounds.maxY - initialCenter.y - viewBoxHeight / 2;
        
        // Apply constraints
        this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
        this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));
    }
    
    updateViewBox() {
        if (!this.svgDomElement) return;
        
        const viewBoxX = this.getViewBoxX();
        const viewBoxY = this.getViewBoxY();
        const viewBoxWidth = this.fixedViewBoxWidth / this.zoom;
        const viewBoxHeight = this.fixedViewBoxHeight / this.zoom;
        
        this.svgDomElement.setAttribute(
            "viewBox",
            `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`
        );
    }
    
    handleContextMenu(e: MouseEvent) {
        if (!this.svgDomElement) return;
        
        e.preventDefault();
        
        const menu = new Menu();
        menu.addItem((item) => {
            item
                .setTitle("Save canvas as PNG")
                .setIcon("download")
                .onClick(() => {
                    this.saveSvgAsPng();
                });
        });
        
        menu.showAtPosition({ x: e.clientX, y: e.clientY });
    }
    
    async saveSvgAsPng() {
        if (!this.svgDomElement || !this.parser) {
            new Notice("Error: SVG element not found");
            return;
        }
        
        try {
            // Get the full content bounds for the PNG
            const contentBounds = this.parser.getContentBounds();
            if (!contentBounds) {
                new Notice("Error: Could not determine map bounds");
                return;
            }
            
            // Calculate dimensions based on content bounds
            const width = contentBounds.maxX - contentBounds.minX;
            const height = contentBounds.maxY - contentBounds.minY;
            
            // Create a clone of the SVG with the full viewBox
            const svgClone = this.svgDomElement.cloneNode(true) as SVGSVGElement;
            svgClone.setAttribute("viewBox", `${contentBounds.minX} ${contentBounds.minY} ${width} ${height}`);
            svgClone.setAttribute("width", width.toString());
            svgClone.setAttribute("height", height.toString());
            
            // Serialize SVG to string
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Create canvas and draw SVG
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            
            if (!ctx) {
                new Notice("Error: Could not create canvas context");
                URL.revokeObjectURL(svgUrl);
                return;
            }
            
            // Fill white background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            
            // Load SVG as image and draw on canvas
            const img = new Image();
            
            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    try {
                        ctx.drawImage(img, 0, 0, width, height);
                        URL.revokeObjectURL(svgUrl);
                        resolve();
                    } catch (error) {
                        URL.revokeObjectURL(svgUrl);
                        reject(error);
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(svgUrl);
                    reject(new Error("Failed to load SVG image"));
                };
                img.src = svgUrl;
            });
            
            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Failed to convert canvas to blob"));
                    }
                }, "image/png");
            });
            
            // Get current file to determine save location
            const activeFile = this.plugin.app.workspace.getActiveFile();
            let basePath = "";
            let baseName = "text-mapper-export";
            
            if (activeFile) {
                const filePath = activeFile.path;
                const lastSlash = filePath.lastIndexOf("/");
                if (lastSlash >= 0) {
                    basePath = filePath.substring(0, lastSlash + 1);
                }
                baseName = activeFile.basename;
            }
            
            // Use settings save location if configured
            let savePath = "";
            if (this.plugin.settings.saveLocation) {
                // Ensure the folder exists
                const folderPath = this.plugin.settings.saveLocation;
                const folder = this.plugin.app.vault.getAbstractFileByPath(folderPath);
                if (!folder) {
                    try {
                        await this.plugin.app.vault.createFolder(folderPath);
                    } catch (error) {
                        // Folder might already exist or path might be invalid
                        console.warn("Could not create folder:", error);
                    }
                }
                savePath = folderPath.endsWith("/") ? folderPath : folderPath + "/";
            } else {
                // If no save location is set, save in the same folder as the current note
                savePath = basePath;
            }
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
            const filename = `${savePath}${baseName}-${timestamp}.png`;
            
            // Save file
            await this.plugin.app.vault.createBinary(filename, await blob.arrayBuffer());
            
            new Notice(`Canvas saved as ${filename}`);
        } catch (error) {
            console.error("Error saving SVG as PNG:", error);
            new Notice(`Error saving canvas: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
