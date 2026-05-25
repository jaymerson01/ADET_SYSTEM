import { useRef } from 'react';

export default function DragDrop({ children, onFile, accept }) {
  const ref = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && (!accept || f.type === accept)) onFile(f);
  };

  const handleChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f && (!accept || f.type === accept)) onFile(f);
  };

  return (
    <label ref={ref} className="dragdrop" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <input className="visually-hidden" type="file" accept={accept} onChange={handleChange} />
      {children}
    </label>
  );
}
