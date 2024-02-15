<script lang="ts">
   import { setContext } from "svelte";
   import {
      hideBorder,
      resizeElement,
      showBorder,
      showResize,
      translateElement,
   } from "./SvgMouseEvents";
   import { key } from "./key";
   import { clampValue, getClientXY } from "$lib/utils";
   import type { SelectedSvgEl } from ".";

   let wheelTimeout: number | undefined = $state();

   let svgContainer: SVGSVGElement | null = $state(null);
   let viewBox = $state("0 0 0 0");
   let activePanDirection: string | null = $state(null);

   let oldScale = 1;

   const minWidth = 1920;
   const minHeight = 1920;
   const maxWidth = 3840;
   const maxHeight = 3840;

   const getWidth = () =>
      clampValue((svgContainer?.clientWidth || 0) * 2, minWidth, maxWidth);
   const getHeight = () =>
      clampValue((svgContainer?.clientHeight || 0) * 2, minHeight, maxHeight);

   setContext(key, {
      getContainer: () => svgContainer,
      getWidth,
      getHeight,
   });

   $effect(() => {
      if (!svgContainer) return;

      viewBox = `0 0 ${svgContainer.clientWidth} ${svgContainer.clientHeight}`;

      let isResizing = false;
      let isTranslating = false;
      let interaction: SelectedSvgEl | null = $state(null);
      let lastInteractedElement: SVGElement | null = $state(null);

      // Обработчики для svgContainer
      svgContainer.addEventListener("wheel", zoom);
      svgContainer.addEventListener("mousedown", mousedown);
      svgContainer.addEventListener("mousemove", mousemove);
      svgContainer.addEventListener("mouseup", mouseup);
      svgContainer.addEventListener("mouseleave", mouseleave);

      // Обработчики для мобильных svgContainer
      svgContainer.addEventListener("touchstart", mousedown);
      svgContainer.addEventListener("touchmove", mousemove);
      svgContainer.addEventListener("touchend", mouseup);
      svgContainer.addEventListener("touchcancel", mouseleave);
      svgContainer.addEventListener("touchstart", (e) => {
         e.preventDefault();
      });

      let initialDistance = null;
      let initialScale = $state(oldScale);

      function getDistance(touches: TouchList) {
         const touch1 = touches[0];
         const touch2 = touches[1];

         return Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY,
         );
      }

      svgContainer.addEventListener("touchstart", (e) => {
         if (e.touches.length === 2) {
            initialDistance = getDistance(e.touches);
            initialScale = oldScale;
         }
      });

      svgContainer.addEventListener("touchmove", (e) => {
         if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches);
            const scaleChange = currentDistance / initialDistance!;
            const newScale = initialScale * scaleChange;

            // Вычисление позиции центра между двумя точками касания
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            // Преобразование координат центра в координаты внутри SVG
            const rect = svgContainer!.getBoundingClientRect();
            const svgCenterX = (centerX - rect.left) / oldScale;
            const svgCenterY = (centerY - rect.top) / oldScale;

            // Изменение размеров viewBox
            const newWidth = svgContainer!.clientWidth / newScale;
            const newHeight = svgContainer!.clientHeight / newScale;

            // Расчет новых координат X и Y для viewBox
            const newX = svgCenterX - newWidth * (centerX / rect.width);
            const newY = svgCenterY - newHeight * (centerY / rect.height);

            viewBox = `${newX} ${newY} ${newWidth} ${newHeight}`;
            oldScale = newScale;
         }
      });

      svgContainer.addEventListener("touchend", (e) => {
         initialDistance = null;
      });

      function zoom(e: WheelEvent) {
         e.preventDefault();

         if (!activePanDirection) {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
               activePanDirection = "horizontal";
            } else {
               activePanDirection = "vertical";
            }
         }

         wheelTimeout && clearTimeout(wheelTimeout);
         wheelTimeout = setTimeout(function () {
            activePanDirection = null;
         }, 100) as unknown as number; // Устанавливаем новый таймаут

         if (e.ctrlKey) {
            const svgWidth = svgContainer!.clientWidth;
            const svgHeight = svgContainer!.clientHeight;
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            // Calculate the scroll delta
            const scrollDelta = e.deltaY || e.detail;
            const scaleChange = (oldScale * scrollDelta) / 100;
            const newScale =
               oldScale + scaleChange <= 1 ? 1 : oldScale + scaleChange;

            // Extract current viewBox attributes
            const [currentX, currentY, currentWidth, currentHeight] =
               svgContainer!.getAttribute("viewBox")!.split(" ").map(Number);

            // Calculate new dimensions and position
            const newWidth = svgWidth * newScale;
            const newHeight = svgHeight * newScale;

            const newX =
               currentX + (currentWidth - newWidth) * (mouseX / svgWidth);
            const newY =
               currentY + (currentHeight - newHeight) * (mouseY / svgHeight);

            viewBox = `${newX < 0 ? 0 : newX} ${
               newY < 0 ? 0 : newY
            } ${newWidth} ${newHeight}`;

            oldScale = newScale;
         } else {
            const [currentX, currentY, currentWidth, currentHeight] =
               svgContainer!.getAttribute("viewBox")!.split(" ").map(Number);

            if (activePanDirection === "horizontal") {
               const newX = currentX + e.deltaX * oldScale;
               viewBox = `${
                  newX < 0 ? 0 : newX
               } ${currentY} ${currentWidth} ${currentHeight}`;
            } else if (activePanDirection === "vertical") {
               const newY = currentY + e.deltaY * oldScale;
               viewBox = `${currentX} ${
                  newY < 0 ? 0 : newY
               } ${currentWidth} ${currentHeight}`;
            }
         }
      }

      function mousedown(e: MouseEvent | TouchEvent) {
         const [currentX, currentY, currentWidth, currentHeight] = viewBox
            .split(" ")
            .map(Number);

         const [clientX, clientY] = getClientXY(e);

         const target = e.target as SVGElement;

         let selectedEdge = null;
         if (target instanceof SVGRectElement) {
            if (target.style.cursor !== "default") {
               isResizing = true;
               selectedEdge = target.dataset.resize!;
            } else {
               target.style.cursor = "grabbing";
               isTranslating = true;
            }

            interaction = {
               el: target,
               start: {
                  clientX: clientX,
                  clientY: clientY,
                  containerX: currentX,
                  containerY: currentY,
                  x: +target.getAttribute("x")!,
                  y: +target.getAttribute("y")!,
                  width: +target.getAttribute("width")!,
                  height: +target.getAttribute("height")!,
               },
               selectedEdge,
            };
         } else {
            interaction = {
               el: target,
               start: {
                  clientX: clientX,
                  clientY: clientY,
                  containerX: currentX,
                  containerY: currentY,
                  x: null,
                  y: null,
                  width: null,
                  height: null,
               },
               selectedEdge,
            };
         }
      }

      function mousemove(e: MouseEvent | TouchEvent) {
         const [clientX, clientY] = getClientXY(e);

         if (interaction) {
            const dx = clientX - interaction.start.clientX;
            const dy = clientY - interaction.start.clientY;

            if (interaction.el == svgContainer) {
               const [currentX, currentY, currentWidth, currentHeight] = viewBox
                  .split(" ")
                  .map(Number);

               const newX = interaction.start.containerX - dx;
               const newY = interaction.start.containerY - dy;

               viewBox = `${newX < 0 ? 0 : newX} ${
                  newY < 0 ? 0 : newY
               } ${currentWidth} ${currentHeight}`;

               lastInteractedElement && hideBorder(lastInteractedElement);
            }

            if (isResizing) {
               resizeElement(interaction, dx, dy);
            }

            if (isTranslating) {
               translateElement(interaction, dx, dy);
            }

            return;
         }

         e.stopPropagation();
         const target = e.target as SVGElement;

         if (lastInteractedElement && target != lastInteractedElement) {
            hideBorder(lastInteractedElement);
         }

         lastInteractedElement = target;
         target != svgContainer && showBorder(target);

         if (e.target instanceof SVGRectElement && !isTranslating) {
            showResize(e.target, e);
         }
      }

      function mouseup() {
         console.log("mouseup");
         lastInteractedElement &&
            (lastInteractedElement.style.cursor = "default");
         isResizing = false;
         isTranslating = false;
         interaction = null;
      }

      function mouseleave() {
         console.log("mouseleave");
         lastInteractedElement &&
            (lastInteractedElement.style.cursor = "default");
         isResizing = false;
         isTranslating = false;
         interaction = null;
      }
   });
</script>

<div class="relative w-full min-h-[500px] flex">
   <svg
      bind:this={svgContainer}
      class="border-[2px] rounded-lg w-full"
      {viewBox}
      xmlns="http://www.w3.org/2000/svg"
   >
      {#if svgContainer}
         <slot />
      {/if}
   </svg>

   <div
      class="absolute right-2 bottom-2 px-2 py-1 text-sm font-bold rounded-sm bg-gray-200 flex flex-col gap-2"
   >
      <p class="text-[8px]/[8px]">
         activePanDirection: {activePanDirection}
      </p>
      <p class="text-[8px]/[8px]">
         position: {viewBox
            .split(" ")
            .slice(0, 2)
            .map((el) => Math.round(Number(el)).toString())
            .join(" ")}
      </p>
      <p class="text-[8px]/[8px]">
         view: {viewBox
            .split(" ")
            .slice(2, 4)
            .map((el) => Math.round(Number(el)).toString())
            .join(" ")}
      </p>
   </div>
</div>
