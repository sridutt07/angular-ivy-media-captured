import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AudioCaptureComponent } from './components/audio-capture/audio-capture.component';
import { ImageCaptureComponent } from './components/image-capture/image-capture.component';
import { MediaHandlerComponent } from './components/media-handler/media-handler.component';
import { VideoCaptureComponent } from './components/video-capture/video-capture.component';
import { MediaCaptureDialogComponent } from './components/media-capture-dialog/media-capture-dialog.component';
import { MediaCaptureMenuComponent } from './components/media-capture-menu/media-capture-menu.component';
import { MaterialModule } from '../material.module';


@NgModule({
    declarations: [
        AudioCaptureComponent,
        ImageCaptureComponent,
        MediaHandlerComponent,
        VideoCaptureComponent,
        MediaCaptureDialogComponent,
        MediaCaptureMenuComponent
    ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [MediaCaptureMenuComponent]
})
export class MediaCaptureModule {
}
