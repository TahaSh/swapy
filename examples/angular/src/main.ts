import { AfterViewInit, Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

import { createSwapy } from 'swapy';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <section class="container">
      <div class="card" data-swapy-slot="a">
        <div class="box" data-swapy-item="a"></div>
      </div>
      <div class="card" data-swapy-slot="b">
        <div class="box" data-swapy-item="b"></div>
      </div>
      <div class="card" data-swapy-slot="c">
        <div class="box" data-swapy-item="c"></div>
      </div>
      <div class="card" data-swapy-slot="d">
      </div>
      <div class="card" data-swapy-slot="e">
      </div>
  </section>
  `,
})
export class App implements AfterViewInit {
  readonly document = inject(DOCUMENT);
  swapy: any;

  ngAfterViewInit(): void {
    this.initSwapy();
    this.initSwapyEventListener();
  }

  private initSwapy(): void {
    const container = this.document.querySelector('.container');

    this.swapy = createSwapy(container, {
      animation: 'dynamic', // or spring or none
    });

    // You can disable and enable it anytime you want
    this.swapy.enable(true);
  }

  private initSwapyEventListener(): void {
    this.swapy?.onSwap((event: any) => {
      console.log(event.data.object);
      console.log(event.data.array);
      console.log(event.data.map);
    });
  }
}

bootstrapApplication(App);
