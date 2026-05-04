import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { resolveImageUrl } from '../../utils/format';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Görsel' }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = resolveImageUrl(value);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post<{ url: string }>('/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
      toast.success('Görsel yüklendi');
    } catch (e) {
      const anyErr = e as { response?: { data?: { message?: string } } };
      toast.error(anyErr.response?.data?.message ?? 'Yükleme başarısız');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-brand-muted">{label}</span>
      <div className="mt-2 flex items-start gap-3">
        <div className="relative h-24 w-24 rounded-xl border border-brand-border bg-brand-background overflow-hidden grid place-items-center">
          {preview ? (
            <>
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white grid place-items-center hover:text-red-400"
                aria-label="Kaldır"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <ImagePlus className="h-7 w-7 text-brand-muted" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-border text-sm hover:border-brand-primary/60 hover:text-brand-primary disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {value ? 'Görseli değiştir' : 'Görsel yükle'}
          </button>
          <p className="text-xs text-brand-muted">JPG, PNG veya WEBP — maksimum 5 MB.</p>
        </div>
      </div>
    </div>
  );
}
