
export type SvgContainerContext = {
  getContainer: () => SVGSVGElement 
  getWidth: () => number 
  getHeight: () => number 
}

export type SvgPlaceData = {
   x: number;
   y: number;
   width: number;
   height: number;
   fill: string;
   rows: SvgRowData[];
};

export type SvgRowData = {
   x: number;
   y: number;
   width: number;
   height: number;
   fill: string;
};

export type SelectedSvgEl = {
  el: SVGElement | null;
  start: {
     clientX: number;
     clientY: number;
     containerX: number;
     containerY: number;
     x: number | null;
     y: number | null;
     width: number | null;
     height: number | null;
  };
  selectedEdge: string | null;
};