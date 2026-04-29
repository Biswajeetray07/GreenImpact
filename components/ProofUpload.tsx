"use client";

import { useState } from 'react';

interface ProofUploadProps {
  winnerId: string;
  currentStatus: string;
  proofUrl?: string;
}

export default function ProofUpload({ winnerId, currentStatus, proofUrl }: ProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localProofUrl, setLocalProofUrl] = useState(proofUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('proof', file);
      
      const res = await fetch(`/api/winners/${winnerId}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        setLocalProofUrl(data.proofUrl);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  if (currentStatus === 'paid') {
    return (
      <div className="bg-[#ECFDF5] text-success px-4 py-3 rounded-full inline-block font-bold">
        ✓ Paid
      </div>
    );
  }

  if (currentStatus === 'rejected') {
    return (
      <div className="bg-[#FEF2F2] text-danger px-4 py-3 rounded-[12px] inline-block font-bold">
        ✗ Rejected — contact support
      </div>
    );
  }

  if (currentStatus === 'approved') {
    return (
      <div className="bg-[#EFF6FF] text-[#1E3A8A] px-4 py-3 rounded-[12px] inline-block font-bold">
        ✓ Approved — payout in progress
      </div>
    );
  }

  if (localProofUrl) {
    return (
      <div className="mt-4">
        <div className="bg-[#F9FAFB] p-4 rounded-[12px] border border-[#E5E7EB] inline-block">
          <p className="text-text-dark font-bold mb-4">Proof submitted — awaiting admin review</p>
          <img src={localProofUrl} alt="Uploaded Proof" className="max-w-xs rounded-lg shadow-sm border border-[#E5E7EB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] p-6 rounded-[12px] border border-[#E5E7EB]">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="block w-full text-sm text-text-muted
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-bold
          file:bg-accent file:text-[#1A1A1A]
          hover:file:bg-[#C2983D]
          cursor-pointer mb-4"
      />
      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`px-6 py-2 rounded-full font-bold transition-colors ${
          !file || uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-[#152e23]'
        }`}
      >
        {uploading ? 'Uploading...' : 'Submit proof'}
      </button>
    </div>
  );
}
