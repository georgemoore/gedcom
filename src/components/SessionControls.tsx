// Session Control Buttons
import { Save, RotateCcw } from 'lucide-react';

interface Props {
  onSave: () => void;
  onReset: () => void;
}

function SessionControls({ onSave, onReset }: Props) {
  return (
    <div className="session-controls">
      <button className="save-button" onClick={onSave}>
        <Save size={16} />
        Save Session
      </button>
      <button className="reset-button" onClick={onReset}>
        <RotateCcw size={16} />
        Reset Matches
      </button>
    </div>
  );
}

export default SessionControls;
