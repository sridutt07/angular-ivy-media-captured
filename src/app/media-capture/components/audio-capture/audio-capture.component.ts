import { Component, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as RecordRTC from 'recordrtc';

import { MediaType } from '../../enums/media-type.enum';
import { MediaModel } from '../../model/media.model';
import { MediaInputModel } from '../../model/media-input.model';
import { mediaConstants } from '../../constants';

const recordRtc = RecordRTC;

@Component({
  selector: 'lib-audio-capture',
  templateUrl: './audio-capture.component.html',
  styleUrls: ['./audio-capture.component.scss']
})
export class AudioCaptureComponent {

  @Input() mediaInputData: MediaInputModel;
  @Output() mediaCaptured = new EventEmitter<MediaModel>();
  @ViewChild('audio', { static: false }) audio: ElementRef;

  private mediaData = new MediaModel();
  private stream: MediaStream;
  private audioViewer: HTMLAudioElement;
  private recordRtc: any;
  private timeOutHandler = 0;
  private startTime = 0;
  private readonly msPerSec = 1000;
  private readonly progressBarEqualParts = 100;


  progressBarTime = 0;
  currentTime = '00:00';
  isCaptured = false;
  isRecording = false;
  platformType: string;
  mediaType: string;
  progressBarEqualizer: number;
  errorMessage = '';


  // constructor(
  //   private readonly sanitizer: DomSanitizer,
  //   private readonly changeDetectorRef: ChangeDetectorRef,
  //   private readonly utils: UtilsService,
  //   private readonly platformDetector: PlatformDetectorService,
  //   private readonly translate: TranslateService
  // ) {
  // }

  // ngAfterViewInit() {
  //   this.audioViewer = this.audio.nativeElement;
  //   this.audioViewer.muted = true;
  //   this.progressBarEqualizer = this.progressBarEqualParts / (this.mediaInputData.audioDuration / this.msPerSec);
  // }

  // startRecording() {
  //   if (this.isCaptured) {
  //     this.audioViewer.srcObject = this.audioViewer.src = null;
  //     this.audioViewer.muted = true;
  //     this.audioViewer.controls = false;
  //     this.isCaptured = false;
  //     this.currentTime = '00:00';
  //     this.progressBarTime = 0;
  //   }
  //   const browser = navigator as any;

  //   browser.getUserMedia = (browser.getUserMedia ||
  //     browser.webkitGetUserMedia ||
  //     browser.mozGetUserMedia ||
  //     browser.msGetUserMedia);

  //   navigator.mediaDevices.getUserMedia({ audio: true }).then((currentStream: MediaStream) => {
  //     this.stream = currentStream;
  //     if (!this.changeDetectorRef['destroyed']) {
  //       this.isRecording = true;
  //       this.startTime = new Date().getTime();
  //       this.recordRtc = recordRtc(currentStream, { type: mediaConstants.audioMimeTypes.webm });
  //       this.recordRtc.setRecordingDuration(this.mediaInputData.audioDuration).onRecordingStopped(this.stopRecording);
  //       this.recordRtc.startRecording();
  //       this.checkTimeProgressed();
  //       this.audioViewer.srcObject = currentStream;
  //     } else {
  //       this.closeStream();
  //     }
  //   }).catch((err) => {
  //     switch (err.name) {
  //       case 'NotAllowedError':
  //       case 'OverconstrainedError':
  //         this.errorMessage = `${this.translate.instant('Media_Microphone')} ${this.translate.instant('Media_Error_Permission')}`;
  //         break;
  //       case 'NotFoundError':
  //         this.errorMessage = `${this.translate.instant('Media_Microphone')} ${this.translate.instant('Media_Error_No_Device')}`;
  //         break;
  //       case 'NotReadableError':
  //         this.errorMessage = `${this.translate.instant('Media_Microphone')} ${this.translate.instant('Media_Error_Source_Busy')}`;
  //         break;
  //       default:
  //         this.errorMessage = `${this.translate.instant('Media_Error_Unknown')} ${this.translate.instant('Media_Microphone')}`;
  //         return;
  //     }
  //   });
  // }

  // triggerStopRecording() {
  //   this.recordRtc.stopRecording(() => {
  //     this.stopRecording();
  //   });
  // }

  // stopRecording = () => {
  //   this.audioViewer.srcObject = this.audioViewer.src = null;
  //   this.isRecording = false;
  //   this.isCaptured = true;
  //   this.audioViewer.muted = false;
  //   this.audioViewer.controls = true;
  //   this.mediaData.executedTime = new Date().getTime();
  //   this.mediaData.fileTypeId = MediaType.Audio;
  //   this.mediaData.file = this.recordRtc.getBlob();
  //   this.mediaData.mimeType = mediaConstants.audioMimeTypes.webm;
  //   this.mediaData.fileUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.recordRtc.getBlob()));
  //   this.audioViewer.src = URL.createObjectURL(this.mediaData.file);
  //   // [HACK] To remove after chrome bug is fixed
  //   if (this.platformDetector.getBrowserType() === BrowserType.Chrome) {
  //     this.audioViewer.onloadedmetadata = () => {
  //       // handle chrome's bug
  //       if (this.audioViewer.duration === Infinity) {
  //         this.audioViewer.currentTime = Number.MAX_SAFE_INTEGER;
  //         this.audioViewer.ontimeupdate = () => {
  //           this.audioViewer.ontimeupdate = () => {
  //             return;
  //           };
  //           // setting player currentTime back to 0 can be buggy too, set it first to .1 sec
  //           this.audioViewer.currentTime = 0.1;
  //           this.audioViewer.currentTime = 0;
  //         };
  //       }
  //     };
  //   }
  //   clearTimeout(this.timeOutHandler);
  //   this.stream.getAudioTracks().forEach(track => track.stop());
  // }


  // confirm() {
  //   this.mediaCaptured.emit(this.mediaData);
  // }

  // checkTimeProgressed = () => {
  //   if (!this.recordRtc) {
  //     return;
  //   }

  //   if (this.progressBarTime < this.mediaInputData.audioDuration) {
  //     this.progressBarTime = new Date().getTime() - this.startTime;
  //     this.currentTime = this.utils.calculateTimeDuration((new Date().getTime() - this.startTime) / this.msPerSec);
  //   }

  //   this.timeOutHandler = setTimeout(this.checkTimeProgressed);
  // }

  // private closeStream() {
  //   if (this.stream !== undefined && this.stream.active) {
  //     this.stream.getAudioTracks().forEach(track => track.stop());
  //     clearTimeout(this.timeOutHandler);
  //   }
  // }

  // ngOnDestroy() {
  //   this.closeStream();
  // }
}
