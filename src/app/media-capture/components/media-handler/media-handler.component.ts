import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MediaModel } from '../../model/media.model';
import { MediaType } from '../../enums/media-type.enum';
import { MediaInputModel } from '../../model/media-input.model';


@Component({
  selector: 'lib-media-handler',
  templateUrl: './media-handler.component.html',
  styleUrls: ['./media-handler.component.scss']
})
export class MediaHandlerComponent {
  @Input() mediaInputData: MediaInputModel;
  @Output() mediaCaptured = new EventEmitter<MediaModel>();
  @ViewChild('image', { static: false }) image: ElementRef;
  mediaType = MediaType;

  receivedMediaData(receivedMedia: MediaModel) {
    this.mediaCaptured.emit(receivedMedia);
  }
}
