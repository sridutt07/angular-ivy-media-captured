import { Component, ElementRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  @ViewChild('photoInputButton', { static: false }) photoInputButton: ElementRef;
  @ViewChild('img', { static: false }) img: ElementRef;
  @ViewChild('canvas') public canvas: ElementRef;


  isCaptured = false;
  isEdit = false;
  fileUrl: any;
  canvasWidth = 25
  canvasHeight = 25

  ctx: CanvasRenderingContext2D;

  constructor(private readonly sanitizer: DomSanitizer,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly dialog: MatDialog,
  ) { }

  test($event) {
    let blob = new Blob([$event], { type: 'image/png' });
    var video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function () {

      window.URL.revokeObjectURL(video.src);

      console.log(video.duration);

      if (video.duration < 1) {

        console.log("Invalid Video! video is less than 1 second");
        return;
      }
    }

    video.src = URL.createObjectURL($event);

    this.fileUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
    this.isCaptured = true;
    this.changeDetectorRef.detectChanges();
    this.img;
  }

  edit() {
   
  }

}
