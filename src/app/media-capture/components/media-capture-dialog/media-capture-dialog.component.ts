import { Component, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MediaInputModel } from '../../model/media-input.model';
import { MediaModel } from '../../model/media.model';
import { MediaType } from '../../enums/media-type.enum';

@Component({
  selector: 'lib-media-capture-dialog',
  templateUrl: './media-capture-dialog.component.html',
  styleUrls: ['./media-capture-dialog.component.scss']
})
export class MediaCaptureDialogComponent {

  mediaType = MediaType;

  constructor(
    public dialogRef: MatDialogRef<MediaCaptureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mediaData: MediaInputModel, urlEndPoint: string },
    private readonly location: Location) {
  }

  receiveMediaData(receivedMedia: MediaModel) {
    if (this.data.urlEndPoint !== '') {
      this.location.back();
    }
    this.dialogRef.close(receivedMedia);
  }

  closeDialog() {
    
    this.dialogRef.close({ event: 'close' });
  }

}
