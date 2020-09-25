import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as RecordRTC from 'recordrtc';

import { MediaType } from '../../enums/media-type.enum';

import { MediaModel } from '../../model/media.model';
import { MediaInputModel } from '../../model/media-input.model';
import { mediaConstants } from '../../constants';


const recordRtc = RecordRTC;


@Component({
  selector: 'lib-video-capture',
  templateUrl: './video-capture.component.html',
  styleUrls: ['./video-capture.component.scss']
})
export class VideoCaptureComponent implements AfterViewInit, OnDestroy {
  @Input() mediaInputData: MediaInputModel;
  @Output() mediaCaptured = new EventEmitter<MediaModel>();
  @ViewChild('video', { static: false }) video: ElementRef;

  private readonly mediaData = new MediaModel();
  private stream: MediaStream;
  private videoViewer: HTMLVideoElement;
  private recordRtc: any;
  private progressBarTime = 0;
  private sizeIntervalHandler: any;
  private readonly intervalPeriod = 100;
  private readonly msPerSec = 1000;


  browser = navigator as any;
  currentVideoSize = 0;
  isCaptured = false;
  isRecording = false;
  pauseHandler = false;
  currentTime = '00:00';
  isPaused = false;
  maxTimeDuration: string;
  mediaType: string;
  errorMessage = '';
  isRearCameraPresent = false;
  facingMode = 'user';
  videoAngle = 0;


  constraints = {
    video: {
      facingMode: this.facingMode
    },
    audio: true
  };

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    this.browser.getUserMedia = (this.browser.getUserMedia ||
      this.browser.webkitGetUserMedia ||
      this.browser.mozGetUserMedia ||
      this.browser.msGetUserMedia);
  }

  async ngAfterViewInit() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');
    if (videoDevices.length > 1) {
      this.isRearCameraPresent = true;
      this.facingMode = 'environment';
      this.constraints = {
        video: {
          facingMode: this.facingMode
        },
        audio: true
      };
    }

    this.videoViewer = this.video.nativeElement;
    this.videoViewer.muted = true;
    this.videoViewer.controls = false;
    this.initVideo();
    this.maxTimeDuration = "20"
  }

  initVideo() {
    // [TOUPGRADE] reduce the time it takes for cam to initialize in all three captures
    this.videoViewer.autoplay = true;
    navigator.mediaDevices.getUserMedia(this.constraints).then(async (currentStream: MediaStream) => {
      this.stream = currentStream;
      if (!this.changeDetectorRef['destroyed']) {
        this.recordRtc = recordRtc(currentStream, { type: mediaConstants.videoMimeTypes.mkv });
        this.recordRtc.startRecording();
        this.videoViewer.srcObject = currentStream;
      } else {
        this.closeStream();
      }
    })
  }

  toggleControls() {
    this.videoViewer.muted = !this.videoViewer.muted;
    this.videoViewer.controls = !this.videoViewer.controls;
  }

  startRecording() {
    // [TOUPGRADE] reduce the transaction time from normal rendering to capture
    if (this.stream.active) {
      this.recordRtc.stopRecording(() => {
        this.videoViewer.srcObject = this.videoViewer.src = null;
        this.videoViewer.src = URL.createObjectURL(new Blob([this.recordRtc.getBlob()], { type: mediaConstants.videoMimeTypes.mkv }));
      });
      this.stream.getAudioTracks().forEach(track => track.stop());
      this.stream.getVideoTracks().forEach(track => track.stop());
    }

    const options = {
      mimeType: mediaConstants.videoMimeTypes.mkv,
      bitsPerSecond: mediaConstants.bitsPerSecond,
      bufferSize: mediaConstants.bufferSize,
      timeSlice: mediaConstants.timeSlice
    };

    navigator.mediaDevices.getUserMedia(this.constraints).then((currentStream: MediaStream) => {
      this.stream = currentStream;
      this.recordRtc = recordRtc(currentStream, options);
      this.videoViewer.srcObject = currentStream;
      this.isRecording = true;
      this.recordRtc.setRecordingDuration(this.mediaInputData.videoDuration).onRecordingStopped(this.stopRecording);
      this.currentTime = '00:00';
      this.recordRtc.startRecording();
      this.sizeIntervalHandler = setInterval(this.checkVideoSize, this.intervalPeriod);
    });
  }

  checkVideoSize = () => { // required to get same instance of recordRtc
    if (!this.recordRtc) {
      return;
    }
    const recorder = this.recordRtc.getInternalRecorder();
    if (recorder && recorder.getArrayOfBlobs) {
      const blob = new Blob(recorder.getArrayOfBlobs(), { type: mediaConstants.videoMimeTypes.mkv });
      this.currentVideoSize = blob.size;
      if (blob.size >= this.mediaInputData.videoSize || this.progressBarTime > this.mediaInputData.videoDuration) {
        // [TOUPGRADE] show toast when stopped due to exceeding video size
        this.recordRtc.stopRecording(this.stopRecording);
        return;
      } else {
        this.progressBarTime += 0.1;
        this.currentTime = "33";
      }
    }
  }

  stopRecording = () => { // required to get same instance of recordRtc
    this.recordRtc.stopRecording(() => {
      this.isRecording = false;
      this.videoViewer.autoplay = false;
      this.videoViewer.srcObject = this.videoViewer.src = null;
      this.mediaData.executedTime = new Date().getTime();
      this.mediaData.file = this.recordRtc.getBlob();
      this.mediaData.mimeType = mediaConstants.videoMimeTypes.mkv;
      this.mediaData.fileTypeId = MediaType.Video;
      this.mediaData.fileUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.recordRtc.getBlob()));
      this.videoViewer.src = URL.createObjectURL(this.mediaData.file);
      // [HACK] To remove after chrome bug is fixed

      this.toggleControls();
      this.isCaptured = true;
      clearInterval(this.sizeIntervalHandler);
    });
    this.stream.getAudioTracks().forEach(track => track.stop());
    this.stream.getVideoTracks().forEach(track => track.stop());
  }

  confirm() {
    this.mediaCaptured.emit(this.mediaData);
  }

  rotateCamera(direction: string) {
    if (direction === 'left') {
      this.videoAngle = this.videoAngle - 90;
    } else {
      this.videoAngle = this.videoAngle + 90;
    }

    if (this.videoAngle === 360 || this.videoAngle === -360) {
      this.videoAngle = 0;
    }

  }

  flipCamera() {
    this.stream.getVideoTracks().forEach(track => track.stop());
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.constraints = {
      video: {
        facingMode: this.facingMode
      },
      audio: true
    };
    this.closeStream();
    this.initVideo();
  }

  retry() {
    this.toggleControls();
    clearInterval(this.sizeIntervalHandler);
    this.pauseHandler = false;
    this.isPaused = false;
    this.isCaptured = false;
    this.videoViewer.srcObject = this.videoViewer.src = null;
    this.progressBarTime = 0;
    this.currentVideoSize = 0;
    this.initVideo();
  }

  togglePausePlay() {
    const pauseStateHelper = this.isPaused;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      clearInterval(this.sizeIntervalHandler);
      this.recordRtc.pauseRecording();
    } else {
      this.sizeIntervalHandler = setInterval(this.checkVideoSize, this.intervalPeriod);
      this.recordRtc.resumeRecording();
    }
    setTimeout(() => {
      this.pauseHandler = !pauseStateHelper;
    }, this.msPerSec);
  }

  private closeStream() {
    if (this.stream !== undefined && this.stream.active) {
      this.stream.getVideoTracks().forEach(track => track.stop());
      this.stream.getAudioTracks().forEach(track => track.stop());
      clearInterval(this.sizeIntervalHandler);
    }
  }

  ngOnDestroy() {
    this.closeStream();
  }

  getBlobDuration(blob): Promise<number> {
    const tempVideoEl = document.createElement('video');

    const durationP = new Promise<number>(resolve =>
      tempVideoEl.addEventListener('loadedmetadata', () => {
        if (tempVideoEl.duration === Infinity) {
          tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER;
          tempVideoEl.ontimeupdate = () => {
            tempVideoEl.ontimeupdate = null;
            resolve(tempVideoEl.duration);
            tempVideoEl.currentTime = 0;
          };
        } else {
          resolve(tempVideoEl.duration);
        }
      }),
    );

    tempVideoEl.src = window.URL.createObjectURL(blob);

    return durationP;
  }
}
