import { MediaType } from 'src/contracts';

export class UpdateMediaEvent {
  id: string;

  originalFilename: string;

  mimeType: string;

  size: number;

  type: MediaType;

  url: string;
}
