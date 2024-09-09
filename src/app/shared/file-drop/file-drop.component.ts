import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileUploadControl, FileUploadModule, FileUploadValidators } from '@iplab/ngx-file-upload';

@Component({
  selector: 'app-file-drop',
  standalone: true,
  imports: [FileUploadModule],
  templateUrl: './file-drop.component.html',
  styleUrl: './file-drop.component.scss'
})
export class FileDropComponent {
  @Input() public allowedExtensions = 'images/*';
  @Input() public multiple = false;
  @Output() selectedFiles: EventEmitter<File[]> = new EventEmitter<File[]>();
  public filesControl = new FileUploadControl(undefined, FileUploadValidators.filesLimit(2));

  public onFilesSelected() {
    const files = this.filesControl.value;
    this.selectedFiles.emit(files);
  }
}
