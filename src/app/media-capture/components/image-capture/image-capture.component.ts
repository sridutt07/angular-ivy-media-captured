import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { MediaType } from '../../enums/media-type.enum';
import { MediaModel } from '../../model/media.model';
import { mediaConstants } from '../../constants';


@Component({
  selector: 'lib-image-capture',
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss']
})
export class ImageCaptureComponent implements AfterViewInit, OnDestroy {

  @ViewChild('video', { static: false }) video: ElementRef;

  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  @Output() mediaCaptured = new EventEmitter<MediaModel>();

  private readonly mediaData = new MediaModel();
  private stream: MediaStream;
  private facingMode = 'user';

  imgSrc: SafeUrl;
  isCaptured = false;
  videoSubscription: Subscription;
  errorMessage = '';
  isRearCameraPresent = false;

  constraints = {
    video: {
      facingMode: this.facingMode
    }
  };

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  async ngAfterViewInit() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');
    if (videoDevices.length > 1) {
      this.isRearCameraPresent = true;
      this.facingMode = 'environment';
      this.constraints.video.facingMode = this.facingMode;
    }

    this.initVideo();
  }

  initVideo() {
    const video = this.video.nativeElement;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(this.constraints)
        .then(async (currentStream) => {
          this.stream = currentStream;
          if (!this.changeDetectorRef['destroyed']) {
            video.srcObject = currentStream;
            video.play();
          } else {
            this.closeStream();
          }
        })
    }
  }

  capture() {
    if (this.stream !== undefined && this.stream.active) {
      const video = this.video.nativeElement;
      this.isCaptured = true;
      this.changeDetectorRef.detectChanges();
      this.canvas.nativeElement.width = video.videoWidth;
      this.canvas.nativeElement.height = video.videoHeight;
      this.canvas.nativeElement.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      this.mediaData.executedTime = new Date().getTime();
      this.mediaData.fileTypeId = MediaType.Image;
      this.mediaData.mimeType = mediaConstants.imageMimeTypes.jpeg;
      this.mediaData.fileUrl = this.imgSrc;
      this.stream.getVideoTracks().forEach(track => track.stop());
    }
  }

  confirm() {
    this.mediaCaptured.emit(this.mediaData);
  }

  retry() {
    this.isCaptured = false;
    this.changeDetectorRef.detectChanges();
    this.initVideo();
  }

  flipCamera() {
    this.stream.getVideoTracks().forEach(track => track.stop());
    this.facingMode = (this.facingMode === 'user') ? 'environment' : 'user';
    this.constraints.video.facingMode = this.facingMode;
    this.initVideo();
  }

  private closeStream() {
    if (this.stream !== undefined && this.stream.active) {
      this.stream.getVideoTracks().forEach(track => track.stop());
    }
  }

  ngOnDestroy() {
    this.closeStream();
  }

}
