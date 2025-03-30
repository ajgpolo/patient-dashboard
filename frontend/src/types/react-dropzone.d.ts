declare module 'react-dropzone' {
  import { ComponentProps } from 'react';

  export interface FileRejection {
    file: File;
    errors: Array<{
      code: string;
      message: string;
    }>;
  }

  export interface DropzoneProps {
    accept?: { [key: string]: string[] };
    disabled?: boolean;
    getFilesFromEvent?: (event: any) => Promise<Array<File | DataTransferItem>>;
    maxSize?: number;
    minSize?: number;
    multiple?: boolean;
    maxFiles?: number;
    onDrop?: <T extends File>(acceptedFiles: T[], fileRejections: FileRejection[], event: any) => void;
    onDropAccepted?: <T extends File>(files: T[], event: any) => void;
    onDropRejected?: (fileRejections: FileRejection[], event: any) => void;
    onFileDialogCancel?: () => void;
    preventDropOnDocument?: boolean;
    noClick?: boolean;
    noKeyboard?: boolean;
    noDrag?: boolean;
    noDragEventsBubbling?: boolean;
  }

  export function useDropzone(props?: DropzoneProps): {
    getRootProps: (props?: any) => any;
    getInputProps: (props?: any) => any;
    open: () => void;
    rootRef: React.RefObject<HTMLElement>;
    inputRef: React.RefObject<HTMLInputElement>;
    isDragActive: boolean;
    isDragAccept: boolean;
    isDragReject: boolean;
    isFileDialogActive: boolean;
  };
} 