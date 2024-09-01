/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { Signal } from "@builder.io/qwik";
import { $, component$, useOnWindow, useSignal } from "@builder.io/qwik";
import { createSwapy } from "swapy";
import "./style.css";

const DEFAULT = {
  "1": "a",
  "3": "c",
  "4": "d",
  "2": null,
};

function A() {
  return (
    <div class="item a" data-swapy-item="a">
      <div class="handle" data-swapy-handle></div>
      <div>A</div>
    </div>
  );
}

function C() {
  return (
    <div class="item c" data-swapy-item="c">
      <div>C</div>
    </div>
  );
}

function D() {
  return (
    <div class="item d" data-swapy-item="d">
      <div>D</div>
    </div>
  );
}

function getItemById(itemId: "a" | "c" | "d" | null) {
  switch (itemId) {
    case "a":
      return <A />;
    case "c":
      return <C />;
    case "d":
      return <D />;
  }
}

const App = component$(() => {
  const slotItems = useSignal() as Signal<
    Record<string, "a" | "c" | "d" | null>
  >;

  useOnWindow(
    "DOMContentLoaded",
    $(() => {
      if (typeof localStorage === "undefined") return;

      slotItems.value = localStorage.getItem("slotItem")
        ? JSON.parse(localStorage.getItem("slotItem")!)
        : DEFAULT;

      console.log(slotItems.value);

      const container = document.querySelector(".container")!;
      const swapy = createSwapy(container);
      swapy.onSwap(({ data }) => {
        localStorage.setItem("slotItem", JSON.stringify(data.object));
      });
    })
  );

  return (
    <div class="container">
      <div class="slot a" data-swapy-slot="1">
        {getItemById(slotItems.value?.["1"])}
      </div>
      <div class="second-row">
        <div class="slot b" data-swapy-slot="2">
          {getItemById(slotItems.value?.["2"])}
        </div>
        <div class="slot c" data-swapy-slot="3">
          {getItemById(slotItems.value?.["3"])}
        </div>
      </div>
      <div class="slot d" data-swapy-slot="4">
        {getItemById(slotItems.value?.["4"])}
      </div>
    </div>
  );
});

export default App;
