import type { SelectedSvgEl } from ".";

export function showResize(svgElement: SVGElement, e: MouseEvent | TouchEvent) {
   let clientX, clientY;
   if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
   } else { // TouchEvent
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
   }

   const bounds = svgElement!.getBoundingClientRect();
   const edgeThreshold = 10; // Расстояние от края для растягивания
   const nearLeftEdge = clientX < bounds.left + edgeThreshold;
   const nearRightEdge = clientX > bounds.right - edgeThreshold;
   const nearTopEdge = clientY < bounds.top + edgeThreshold;
   const nearBottomEdge = clientY > bounds.bottom - edgeThreshold;


   if (nearRightEdge && nearBottomEdge) {
      svgElement.style.cursor = "nwse-resize"; // Нижний правый угол
      svgElement.dataset.resize = "br";
   } else if (nearLeftEdge && nearBottomEdge) {
      svgElement.style.cursor = "nesw-resize"; // Нижний левый угол
      svgElement.dataset.resize = "bl";
   } else if (nearLeftEdge && nearTopEdge) {
      svgElement.style.cursor = "nwse-resize"; // Верхний левый угол
      svgElement.dataset.resize = "tl";
   } else if (nearRightEdge && nearTopEdge) {
      svgElement.style.cursor = "nesw-resize"; // Верхний правый угол
      svgElement.dataset.resize = "tr";
   } else if (nearLeftEdge) {
      svgElement.style.cursor = "ew-resize"; // Левый край
      svgElement.dataset.resize = "l";
   } else if (nearRightEdge) {
      svgElement.style.cursor = "ew-resize"; // Правый край
      svgElement.dataset.resize = "r";
   } else if (nearTopEdge) {
      svgElement.style.cursor = "ns-resize"; // Верхний
      svgElement.dataset.resize = "t";
   } else if (nearBottomEdge) {
      svgElement.style.cursor = "ns-resize"; // Нижний край
      svgElement.dataset.resize = "b";
   } else {
      svgElement.style.cursor = "default";
      svgElement.dataset.resize = "";
   }
}
export function resizeElement(svgElement: SelectedSvgEl, dx: number, dy: number) {
   const el = svgElement.el!;

   const setSide = (...arrays: [string, number][]) =>
      arrays.forEach(array => {
         const property = array[0]
         const value = Math.max(array[1], 10).toString()

         el.setAttribute(
            property,
            value
         );
      });

   switch (svgElement.selectedEdge) {
      case "br": // Нижний правый угол
         setSide(
            ["width", svgElement.start.width! + dx],
            ["height", svgElement.start.height! + dy],
         );
         break;
      case "bl": // Нижний левый угол
         setSide(
            ["width", svgElement.start.width! - dx],
            ["height", svgElement.start.height! + dy]
         )
         el.setAttribute("x",
            Math.min(
               svgElement.start.x! + dx,
               svgElement.start.x! + svgElement.start.width! - 10).toString()
         )
         break;
      case "r": // Правый край
         setSide(["width", svgElement.start.width! + dx]);
         break;
      case "l": // Левый край
         setSide(["width", svgElement.start.width! - dx]);

         el.setAttribute(
            "x",
            Math.min(
               svgElement.start.x! + dx,
               svgElement.start.x! + svgElement.start.width! - 10).toString()
         )
         break;
      case "b": // Нижний край
         setSide(["height", svgElement.start.height! + dy]);
         break;
      case "t": // Верхний край
         setSide(["height", svgElement.start.height! - dy]);

         el.setAttribute(
            "y",
            Math.min(
               svgElement.start.y! + dy,
               svgElement.start.y! + svgElement.start.height! - 10).toString()
         )
         break;
      case "tl": // Верхний левый угол
         setSide(
            ["width", svgElement.start.width! - dx],
            ["height", svgElement.start.height! - dy]
         );

         el.setAttribute(
            "x",
            Math.min(
               svgElement.start.x! + dx,
               svgElement.start.x! + svgElement.start.width! - 10).toString()
         )
         el.setAttribute("y",
            Math.min(
               svgElement.start.y! + dy,
               svgElement.start.y! + svgElement.start.height! - 10).toString()
         )
         break;
      case "tr": // Верхний правый угол
         setSide([
            "width",
            svgElement.start.width! + dx], [
            "height",
            svgElement.start.height! - dy]
         );

         el.setAttribute("y",
            Math.min(
               svgElement.start.y! + dy,
               svgElement.start.y! + svgElement.start.height! - 10).toString()
         )
         break;
   }

}
export function translateElement(svgElement: SelectedSvgEl, dx: number, dy: number) {
   const el = svgElement.el!;

   el.setAttribute('x', (svgElement!.start!.x! + dx).toString())
   el.setAttribute('y', (svgElement!.start!.y! + dy).toString())
}
export function showBorder(svgElement: SVGElement) {
   svgElement.classList.add("stroke-[4px]")

} export function hideBorder(svgElement: SVGElement) {
   svgElement.classList.remove("stroke-[4px]")
}