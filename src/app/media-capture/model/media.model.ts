import { SafeUrl } from '@angular/platform-browser';

export class MediaModel {
    mimeType: string;
    executedTime: number;
    fileTypeId: number;
    file: Blob;
    fileUrl?: string | SafeUrl;
}
