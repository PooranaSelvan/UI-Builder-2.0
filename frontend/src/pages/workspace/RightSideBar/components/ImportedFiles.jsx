import {
  Folder,
  FileText,
  Eye,
  Pencil,
  Trash2,
  RefreshCcw
} from "lucide-react";
import "./ImportedFile.css";

export default function ImportedFiles({ files, onDelete }) {
  return (
    <div className="imported-files">
      <div className="imported-header">
        <div className="title">
          <Folder size={16} color="red" />
          <span>Imported Files</span>
          <span className="count">{files.length}</span>
        </div>
      </div>

      {files.map((file) => (
        <FileRow key={file.id} file={file} onDelete={onDelete} />
      ))}
    </div>
  );
}

function FileRow({ file, onDelete }) {
  const iconMap = {
    csv: "green",
    json: "orange",
    xlsx: "blue"
  };

  return (
    <div className={`file-card ${file.status === "uploading" ? "uploading" : ""}`}>
      <div className={`file-icon ${iconMap[file.type]}`}>
        {file.status === "uploading" ? (
          <RefreshCcw size={16} />
        ) : (
          <FileText size={16} />
        )}
      </div>

      <div className="file-info">
        <strong>{file.name}</strong>

        {file.status === "done" && (
          <small>
            {file.size} • {file.meta}
          </small>
        )}

        {file.content && (
          <pre className="file-preview">
            {file.content.slice(0, 200)}
          </pre>
        )}

        {file.status === "uploading" && (
          <>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${file.progress}%` }}
              />
            </div>
            <small className="upload-text">
              Uploading… {file.progress}%
            </small>
          </>
        )}
      </div>

      {file.actions && (
        <div
          className="file-actions"
          onClick={() => onDelete(file.id)}
        >
          <Trash2 size={14} />
        </div>
      )}

      {file.status === "uploading" && (
        <div className="file-actions">
          <Trash2 size={14} />
        </div>
      )}
    </div>
  );
}