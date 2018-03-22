import * as React from 'react';
import * as classNames from 'classnames';
import { Attachment } from 'klendathu-json-types';
import { Project } from '../../models';
import { UploadableFile } from './UploadableFile';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import './attachments.scss';

interface Props {
  fileList: Attachment[];
  project: Project;
}

@observer
export class FileDropZone extends React.Component<Props> {
  @observable private isOver = false;
  @observable private canDrop = false;
  private fileInput: HTMLInputElement;

  public render() {
    const { fileList } = this.props;
    return (
      <label
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          htmlFor="upload"
          className={classNames('file-drop-zone', { over: this.isOver, canDrop: this.canDrop })}
      >
        {fileList.length === 0 && <span>Drop files here to upload (or click)</span>}
        <input
            type="file"
            id="upload"
            multiple={true}
            style={{ display: 'none' }}
            onChange={this.onFileChange}
            ref={el => { this.fileInput = el; }}
        />
      </label>
    );
  }

  @action.bound
  private onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    for (const item of e.dataTransfer.items as any) {
      if (item.kind === 'file') {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.isOver = true;
        break;
      }
    }
  }

  @action.bound
  private onDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.isOver = false;
  }

  @action.bound
  private onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    this.addFiles(e.dataTransfer.files);
  }

  @action.bound
  private onFileChange() {
    this.addFiles(this.fileInput.files);
    this.fileInput.value = '';
  }

  private addFiles(filesToAdd: FileList) {
    const { fileList, project } = this.props;
    for (const f of filesToAdd as any) {
      console.log(f.url);
      const index = fileList.findIndex(file => file.filename === f.name);
      if (index >= 0) {
        fileList[index] = new UploadableFile(project, f);
      } else {
        fileList.push(new UploadableFile(project, f));
      }
    }
  }
}
