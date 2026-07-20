"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, CheckCircle, Camera } from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { selectUid } from "@/feature/authentication/authSlice";
import { useGetEnrichedProfileQuery, useUpdateProfileMutation } from "@/feature/profile/profileApiSlice";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";

export default function IDVerifyPage() {
  const [currentStep, setCurrentStep] = useState<'capture' | 'review' | 'uploading' | 'completed'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const uid = useSelector(selectUid);
  const { data: profileData, isLoading: profileLoading } = useGetEnrichedProfileQuery(uid!, { skip: !uid });
  const profileId = (profileData as any)?.data?.id || (profileData as any)?.id;

  const { upload, isUploading, progress } = useCloudinaryUpload();
  const [updateProfile, { isLoading: isSubmitting }] = useUpdateProfileMutation();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(console.error);
      }
    } catch {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const handleCaptureImage = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.85));
        stopCamera();
        setCurrentStep('review');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setCurrentStep('review');
    }
  };

  const handleSubmit = async () => {
    if (!profileId) {
      setUploadError('Profile not found. Please complete your profile setup first.');
      return;
    }
    setUploadError(null);
    setCurrentStep('uploading');

    let file: File;
    if (capturedImage) {
      // Convert data URL → blob → File
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      file = new File([blob], `id-proof-${Date.now()}.jpg`, { type: 'image/jpeg' });
    } else if (uploadedFile) {
      file = uploadedFile;
    } else {
      setUploadError('No image selected.');
      setCurrentStep('review');
      return;
    }

    const result = await upload(file, { folder: 'aphrodite/id-proofs', resourceType: 'image' });
    if (!result.success) {
      setUploadError(result.error || 'Upload failed. Please try again.');
      setCurrentStep('review');
      return;
    }

    try {
      await updateProfile({
        id: profileId,
        data: { issuedIdUrl: result.data!.secure_url },
      }).unwrap();
      setCurrentStep('completed');
    } catch (err: any) {
      setUploadError(err?.data?.message || 'Failed to save ID. Please try again.');
      setCurrentStep('review');
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setUploadedFile(null);
    setUploadError(null);
    setCurrentStep('capture');
  };

  const handleContinue = () => {
    // Return to the verification hub so it can mark this step done
    window.location.href = '/id-verification?verified=true';
  };

  useEffect(() => { return () => { stopCamera(); }; }, []);

  useEffect(() => {
    if (currentStep === 'capture' && !isCameraActive) startCamera();
  }, [currentStep, isCameraActive]);

  if (currentStep === 'capture') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard title="Capture ID Image" description="Position your government-issued ID clearly in the frame and take a photo">
          <div className="space-y-8">
            <div className="bg-white/5 rounded-[20px] p-8 text-center border border-white/10">
              {isCameraActive && stream ? (
                <div className="w-64 h-40 bg-gray-800 rounded-lg mx-auto mb-4 overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-64 h-40 bg-gray-800 rounded-lg mx-auto mb-4 flex flex-col items-center justify-center gap-2">
                  <Camera className="w-12 h-12 text-white/40" />
                  <Button onClick={startCamera} size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">Start Camera</Button>
                </div>
              )}
              <p className="text-white/60 text-sm">
                {isCameraActive ? "Hold your ID steady in the frame" : "Click 'Start Camera' to begin"}
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.history.back()} variant="outline" className="flex-1">Back</Button>
              <Button onClick={handleCaptureImage} disabled={!isCameraActive} className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>

            <div className="text-center">
              <p className="text-white/60 text-sm mb-3">Or upload from device</p>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload} className="hidden" id="id-upload" />
              <label htmlFor="id-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                <Upload className="w-4 h-4" />
                Choose File
              </label>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard title="Review your ID" description="Make sure the ID is clearly visible, then submit">
          <div className="space-y-6">
            {capturedImage && (
              <div className="w-full h-48 bg-gray-800 rounded-xl overflow-hidden relative">
                <Image src={capturedImage} alt="Captured ID" fill className="object-cover" />
              </div>
            )}
            {uploadedFile && (
              <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
                <Upload className="w-5 h-5 text-pink-400 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-white/50 text-xs">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
            {uploadError && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">{uploadError}</p>
            )}
            <div className="flex gap-4">
              <Button onClick={handleRetry} variant="outline" className="flex-1">Retake</Button>
              <Button onClick={handleSubmit} disabled={isUploading || isSubmitting || profileLoading} className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 disabled:opacity-50">
                Submit ID
              </Button>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (currentStep === 'uploading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard title="Uploading your ID..." description="Please wait while we securely upload your document">
          <div className="space-y-6 py-4">
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div className="bg-pink-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${Math.max(progress, 5)}%` }} />
            </div>
            <p className="text-center text-white/60 text-sm">{Math.round(progress)}% uploaded</p>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="relative bg-white/6 backdrop-blur-md rounded-[24px] w-[586px] py-[40px] mx-4 text-white border border-white/20 font-urbanist">
          <div className="flex flex-col justify-center w-[386px] mx-auto gap-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-4 border-green-500">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">ID Submitted!</h2>
              <p className="text-white/60 text-base leading-relaxed">
                Your government-issued ID has been submitted for review. Our team will verify it and get back to you.
              </p>
            </div>
            <Button onClick={handleContinue} fullWidth size="lg" className="bg-pink-600 hover:bg-pink-700 text-white font-semibold">
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
