import "./attachments.scss";
import { useState, useCallback, useEffect } from "react";
import { Paperclip, Download, Trash2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

function Attachments({ onFilesChange }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const generateMockFileData = (file) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type,
    lastModified: file.lastModified,
    // Create a local URL for the file
    url: URL.createObjectURL(file),
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles = droppedFiles.map(generateMockFileData);

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(generateMockFileData);

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    e.target.value = ""; // Reset input
  }, []);

  const handleDelete = useCallback((id) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  }, []);

  const handleDownload = useCallback((file) => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  //  *** Pass All Data to Father (NewPurchaseOrder)  ***
  useEffect(() => {
    onFilesChange(files);
  }, [files, onFilesChange]);

  return (
    <div className={`attachments ${theme}`}>
      <h2 className="attachments__title">{t("Attachments")}</h2>

      <div
        className={`attachments__dropzone ${
          isDragging ? "attachments__dropzone--active" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="attachments__content">
          <div className="attachments__icon">
            <Paperclip />
          </div>

          <p className="attachments__text">{t("Drag and drop files here")} </p>

          <p className="attachments__separator">or</p>

          <label className="attachments__browse">
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="attachments__input"
            />
            <span className="attachments__browse-text">
              <Upload size={16} /> {t("Browse Files")}
            </span>
          </label>

          <p className="attachments__limit">
            {t("File size is limited to 20 MB")}
          </p>

          <p className="attachments__formats">
            {t("Supported file formats are")}
            <br />
            {t("gif .png .jpg .jpeg .bmp .webp .pdf .csv .doc .xlsx .xls")}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="attachments__files">
          {files.map((file) => (
            <div key={file.id} className="attachments__file">
              <div className="attachments__file-info">
                <div className="attachments__file-icon">
                  <Paperclip />
                </div>
                <div className="attachments__file-details">
                  <p className="attachments__file-name">{file.name}</p>
                  <p className="attachments__file-size">{file.size}</p>
                </div>
              </div>

              <div className="attachments__file-actions">
                <button
                  className="attachments__action-btn"
                  onClick={() => handleDownload(file)}
                >
                  <Download />
                </button>
                <button
                  className="attachments__action-btn"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Attachments;
