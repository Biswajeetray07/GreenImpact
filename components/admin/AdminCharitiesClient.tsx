"use client";

import { useState } from 'react';

export default function AdminCharitiesClient({ initialCharities }: { initialCharities: any[] }) {
  const [charities, setCharities] = useState(initialCharities);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [website, setWebsite] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleCreate = async () => {
    setUploading(true);
    let uploadedImageUrl = '';

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch('/api/admin/charities/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedImageUrl = uploadData.imageUrl;
        } else {
          alert(uploadData.error || 'Error uploading image');
          setUploading(false);
          return;
        }
      }

      const res = await fetch('/api/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, image_url: uploadedImageUrl, website })
      });
      const data = await res.json();
      if (res.ok) {
        setCharities([data, ...charities]);
        setName(''); setDescription(''); setImageFile(null); setWebsite('');
      } else {
        alert(data.error || 'Error creating charity');
      }
    } catch (e) {
      alert('Error creating charity');
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (id: string, field: string, currentValue: boolean) => {
    try {
      const res = await fetch('/api/charities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value: !currentValue })
      });
      const data = await res.json();
      if (res.ok) {
        setCharities(charities.map(c => c.id === id ? { ...c, [field]: !currentValue } : c));
      } else {
        alert(data.error || 'Error toggling');
      }
    } catch (e) {
      alert('Error toggling');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this charity?')) return;
    try {
      const res = await fetch('/api/charities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setCharities(charities.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error deleting charity');
      }
    } catch (e) {
      alert('Error deleting charity');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl text-primary">Manage Charities</h1>
      
      <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
        <h2 className="font-serif text-2xl text-primary mb-4">Add Charity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="px-4 py-2 border border-[#E5E7EB] rounded-[8px]" />
          <input type="text" placeholder="Website URL" value={website} onChange={e => setWebsite(e.target.value)} className="px-4 py-2 border border-[#E5E7EB] rounded-[8px]" />
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-text-dark mb-1">Charity Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => e.target.files && setImageFile(e.target.files[0])} 
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-[8px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-accent file:text-[#1A1A1A] hover:file:bg-[#C2983D] cursor-pointer text-text-muted" 
            />
          </div>
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="px-4 py-2 border border-[#E5E7EB] rounded-[8px] sm:col-span-2" rows={3}></textarea>
        </div>
        <button onClick={handleCreate} disabled={uploading} className={`bg-primary text-white font-bold py-2 px-6 rounded-[8px] transition-colors ${uploading ? 'bg-opacity-50 cursor-not-allowed' : 'hover:bg-[#152e23]'}`}>
          {uploading ? 'Adding...' : 'Add Charity'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-sm text-text-muted">
                <th className="pb-3">Name</th>
                <th className="pb-3">Featured</th>
                <th className="pb-3">Active</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {charities.map(c => (
                <tr key={c.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                  <td className="py-4 font-bold text-text-dark">{c.name}</td>
                  <td className="py-4">
                    <button onClick={() => handleToggle(c.id, 'is_featured', c.is_featured)} className={`px-3 py-1 rounded-full text-xs font-bold ${c.is_featured ? 'bg-accent text-[#1A1A1A]' : 'bg-gray-200 text-gray-700'}`}>
                      {c.is_featured ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="py-4">
                    <button onClick={() => handleToggle(c.id, 'is_active', c.is_active)} className={`px-3 py-1 rounded-full text-xs font-bold ${c.is_active ? 'bg-[#ECFDF5] text-success' : 'bg-gray-200 text-gray-700'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-4 text-right space-x-3">
                    <button onClick={() => handleDelete(c.id)} className="text-danger hover:text-red-800 font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
