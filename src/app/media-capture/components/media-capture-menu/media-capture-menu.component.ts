import { Component, ElementRef, ViewChild, EventEmitter, Output, ChangeDetectorRef, Renderer2, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

import { MediaCaptureDialogComponent } from '../media-capture-dialog/media-capture-dialog.component';
import { MediaType } from '../../enums/media-type.enum';
import { MediaModel } from '../../model/media.model';
import { MediaInputModel } from '../../model/media-input.model';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';


@Component({
  selector: 'lib-media-capture-menu',
  templateUrl: './media-capture-menu.component.html',
  styleUrls: ['./media-capture-menu.component.scss']
})
export class MediaCaptureMenuComponent {

  @ViewChild('htmlCapture', { static: false }) htmlCapture: ElementRef;
  @Input() isDisabled: boolean;
  @Output() mediaCaptured = new EventEmitter<MediaModel>();

  mediaType = MediaType;
  selectedMediaType: number;
  validVideoDuration: number;
  validVideoSize: number;
  msPerSec = 1000;
  bitsPerMb = 1000000;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly dialog: MatDialog,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    private readonly snackBar: MatSnackBar,
  ) {
    this.validVideoDuration = 100000;
    this.validVideoSize = 1000000000;
  }

  getMedia(mediaType: MediaType) {
    this.selectedMediaType = mediaType;
    const mediaData = new MediaInputModel();
    let panelClass = 'media-capture';
    if (this.selectedMediaType === MediaType.Audio) {
      panelClass = 'media-capture-audio';
    }
    mediaData.mediaType = this.selectedMediaType;
    mediaData.videoDuration = this.validVideoDuration;
    mediaData.videoSize = this.validVideoSize;
    mediaData.audioDuration = 60000;

    const dialogRef = this.dialog.open(MediaCaptureDialogComponent, {
      panelClass,
      data: { mediaData, urlEndPoint: "video" },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((capturedMedia: any) => {
      if (capturedMedia !== undefined && capturedMedia.event === undefined) {
        this.mediaCaptured.emit(capturedMedia);
      }
    });

  }

  htmlClick(mediaType: MediaType) {
    this.selectedMediaType = mediaType;
    this.changeDetectorRef.detectChanges();
    this.renderer.selectRootElement(this.htmlCapture.nativeElement).click();
  }

  htmlMediaCapture(file: File) {
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.onloadedmetadata = () => {

      window.URL.revokeObjectURL(video.src);

      if (video.duration > this.validVideoDuration || file.size > this.validVideoSize) {

        return;
      }
      this.processHtmlMediaCaptured(file);
    };

    video.src = URL.createObjectURL(file);
  }

  processHtmlMediaCaptured(file: File) {
    const mediaFile = new MediaModel();
    mediaFile.executedTime = file.lastModified;
    mediaFile.file = new Blob([file], { type: file.type });
    mediaFile.fileUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(mediaFile.file));
    mediaFile.mimeType = file.type;
    if (file.type.indexOf(this.mediaType[this.mediaType.Image].toLowerCase()) === 0) {
      mediaFile.fileTypeId = this.mediaType.Image;
    } else if (file.type.indexOf(this.mediaType[this.mediaType.Video].toLowerCase()) === 0) {
      mediaFile.fileTypeId = this.mediaType.Video;
    }
    this.mediaCaptured.emit(mediaFile);
  }

}
