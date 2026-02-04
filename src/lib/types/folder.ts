export interface Folder {
    path: string;
    pathHash: string;
    lastTime: number;
    ctime: number;
    mtime: number;
}

export interface FolderListResponse {
    code: number;
    status: boolean;
    message: string;
    data: Folder[];
}
