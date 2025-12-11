import { useRef, useState } from 'react';
import { parseGedcom, GedcomFile } from '../gedcomParser';
import { Upload } from 'lucide-react';

interface Props {
  onFilesLoaded: (left: GedcomFile, right: GedcomFile) => void;
}

function FileUploadView({ onFilesLoaded }: Props) {
  const [leftFile, setLeftFile] = useState<GedcomFile | null>(null);
  const [rightFile, setRightFile] = useState<GedcomFile | null>(null);
  const [error, setError] = useState<string>('');
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    file: File | null,
    side: 'left' | 'right'
  ) => {
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseGedcom(text, file.name);

      if (parsed.people.length === 0) {
        setError(`No individuals found in ${file.name}`);
        return;
      }

      if (side === 'left') {
        setLeftFile(parsed);
      } else {
        setRightFile(parsed);
      }
      setError('');
    } catch (err) {
      setError(`Error parsing ${file.name}: ${String(err)}`);
    }
  };

  const handleCompare = () => {
    if (leftFile && rightFile) {
      onFilesLoaded(leftFile, rightFile);
    }
  };

  return (
    <div className="file-upload-view">
      <div className="upload-container">
        <div className="upload-column">
          <h2>Select First File</h2>
          <div className="upload-area">
            <input
              ref={leftInputRef}
              type="file"
              accept=".ged,.txt"
              onChange={e => handleFileSelect(e.target.files?.[0] || null, 'left')}
              style={{ display: 'none' }}
            />
            <button
              className="upload-button"
              onClick={() => leftInputRef.current?.click()}
            >
              <Upload size={24} />
              <span>Choose File</span>
            </button>
            {leftFile && (
              <div className="file-info">
                <p className="filename">{leftFile.filename}</p>
                <p className="record-count">
                  {leftFile.recordCount} individuals
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="upload-column">
          <h2>Select Second File</h2>
          <div className="upload-area">
            <input
              ref={rightInputRef}
              type="file"
              accept=".ged,.txt"
              onChange={e => handleFileSelect(e.target.files?.[0] || null, 'right')}
              style={{ display: 'none' }}
            />
            <button
              className="upload-button"
              onClick={() => rightInputRef.current?.click()}
            >
              <Upload size={24} />
              <span>Choose File</span>
            </button>
            {rightFile && (
              <div className="file-info">
                <p className="filename">{rightFile.filename}</p>
                <p className="record-count">
                  {rightFile.recordCount} individuals
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        className="compare-button"
        disabled={!leftFile || !rightFile}
        onClick={handleCompare}
      >
        Compare Files
      </button>
    </div>
  );
}

export default FileUploadView;
