import {
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    Plugin,
} from "obsidian";
//import { APOCALYPSE } from "./apocalypse";
import { ParseError } from "./error";
//import { GNOMEYLAND } from "./gnomeyland";
import { TextMapperParser } from "./parser";
import { TAG_AND_TALLY } from "./tag-and-tally";

export default class TextMapperPlugin extends Plugin {
    async onload() {
        console.log("Loading Obsidian TextMapper.");
        this.registerMarkdownCodeBlockProcessor(
            "text-mapper",
            this.processMarkdown.bind(this)
        );
    }

    async processMarkdown(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): Promise<any> {
        try {
            ctx.addChild(new TextMapper(el, ctx.docId, source));
        } catch (e) {
            console.log("text mapper error", e);
            ctx.addChild(new ParseError(el));
        }
    }

    onunload() {}
}

export class TextMapper extends MarkdownRenderChild {
    textMapperEl: HTMLDivElement;
    svgEl: SVGElement | null = null;
    svgDomElement: SVGSVGElement | null = null;
    parser: TextMapperParser | null = null;
    
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

    constructor(containerEl: HTMLElement, docId: string, source: string) {
        super(containerEl);
        this.textMapperEl = this.containerEl.createDiv({ cls: "textmapper" });

        const totalSource = TAG_AND_TALLY.split("\n")
            .concat(source.split("\n"))
            // .concat(GNOMEYLAND.split("\n"))
            // .concat(APOCALYPSE.split("\n"));

        this.parser = new TextMapperParser(docId);
        this.parser.process(totalSource);
        this.svgEl = this.parser.svg(this.textMapperEl);
        
        // Get the actual DOM element
        this.svgDomElement = this.textMapperEl.querySelector("svg") as SVGSVGElement;
        
        // Get content bounds for pan limits
        this.contentBounds = this.parser.getContentBounds();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Set initial cursor style and update viewBox
        if (this.svgDomElement) {
            this.svgDomElement.style.cursor = "grab";
            // Ensure initial viewBox is set correctly (with pan=0, zoom=1)
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
}
