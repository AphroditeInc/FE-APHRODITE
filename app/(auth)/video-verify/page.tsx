"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { Video, CheckCircle, Camera, Square } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUid } from "@/feature/authentication/authSlice";
import { useGetEnrichedProfileQuery } from "@/feature/profile/profileApiSlice";
import { useUpdateProfileVideoMutation } from "@/feature/profile/profileApiSlice";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";

export default function VideoVerifyPage() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'recording' | 'review' | 'uploading' | 'completed'>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);

  const uid = useSelector(selectUid);
  const { data: profileData, isLoading: profileLoading } = useGetEnrichedProfileQuery(uid!, { skip: !uid });
  const profileId = (profileData as any)?.data?.id || (profileData as any)?.id;

  const { upload, isUploading, progress } = useCloudinaryUpload();
  const [uploadVideoProof, { isLoading: isSubmitting }] = useUpdateProfileVideoMutation();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      }).catch(() =>
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      );
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(console.error);
      }
    } catch {
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const startRecording = () => {
    if (!stream) return;
    setIsRecording(true);
    setCurrentStep('recording');
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      recordedBlobRef.current = blob;
      setRecordedVideoUrl(URL.createObjectURL(blob));
      setCurrentStep('review');
      stopCamera();
    };
    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!recordedBlobRef.current) return;
    if (!profileId) {
      setUploadError('Profile not found. Please complete your profile setup first.');
      return;
    }
    setUploadError(null);
    setCurrentStep('uploading');

    const file = new File([recordedBlobRef.current], `video-proof-${Date.now()}.webm`, { type: 'video/webm' });

    const result = await upload(file, { resourceType: 'video', folder: 'aphrodite/video-proofs' });
    if (!result.success) {
      setUploadError(result.error || 'Upload failed. Please try again.');
      setCurrentStep('review');
      return;
    }

    try {
      await uploadVideoProof({
        userId: profileId,
        videoUrl: result.data!.secure_url,
        fileType: 'webm',
      }).unwrap();
      setCurrentStep('completed');
    } catch (err: any) {
      setUploadError(err?.data?.message || 'Failed to save video proof. Please try again.');
      setCurrentStep('review');
    }
  };

  const handleRetry = () => {
    setRecordedVideoUrl(null);
    recordedBlobRef.current = null;
    setUploadError(null);
    setCurrentStep('setup');
  };

  const handleContinue = () => {
    // Return to the verification hub so it can mark this step done
    // Hub will auto-redirect to dashboard once both steps are complete
    window.location.href = '/id-verification?videoVerified=true';
  };

  useEffect(() => { return () => { stopCamera(); }; }, []);

  useEffect(() => {
    if (currentStep === 'setup' && !isCameraActive) startCamera();
  }, [currentStep, isCameraActive]);

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard title="Video Proof Setup" description="Position yourself in the frame and prepare to record a short selfie video">
          <div className="space-y-8">
            <div className="bg-white/5 rounded-[20px] p-8 text-center border border-white/10">
              {isCameraActive && stream ? (
                <div className="w-80 h-60 bg-gray-800 rounded-lg mx-auto mb-4 overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                </div>
              ) : (
                <div className="w-80 h-60 bg-gray-800 rounded-lg mx-auto mb-4 flex flex-col items-center justify-center">
                  <Camera className="w-12 h-12 text-white/40 mb-2" />
                  <Button onClick={startCamera} size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">Start Camera</Button>
                </div>
              )}
              <p className="text-white/60 text-sm">{isCameraActive ? "Position your face in the frame" : "Click 'Start Camera' to begin"}</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm font-medium mb-1">Tips for a good recording:</p>
              <ul className="text-blue-200/80 text-sm space-y-0.5">
                <li>• Face good lighting, look at the camera</li>
                <li>• Say: &ldquo;I am [Your Name] and I confirm my identity&rdquo;</li>
                <li>• Keep it under 30 seconds</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.history.back()} variant="outline" className="flex-1">Back</Button>
              <Button onClick={startRecording} disabled={!isCameraActive} className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Video className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (currentStep === 'recording') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard title="Recording..." description="Show your face clearly and speak your confirmation">
          <div className="space-y-8">
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
              {stream && (
                <div className="w-full h-64 bg-gray-800 rounded-lg overflow-hidden relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-sm font-medium">REC</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={() => { stopRecording(); stopCamera(); setCurrentStep('setup'); }} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard title="Review your video" description="Watch the recording below. If it looks good, submit it.">
          <div className="space-y-6">
            {recordedVideoUrl && (
              <video src={recordedVideoUrl} controls className="w-full h-48 bg-gray-800 rounded-xl object-contain" />
            )}
            {uploadError && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">{uploadError}</p>
            )}
            <div className="flex gap-4">
              <Button onClick={handleRetry} variant="outline" className="flex-1">Retake</Button>
              <Button onClick={handleSubmit} disabled={isUploading || isSubmitting || profileLoading} className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50">
                Submit Video
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
        <AuthCard title="Uploading your video..." description="Please wait while we securely upload your video proof">
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
              <h2 className="text-2xl font-bold mb-3">Video Submitted!</h2>
              <p className="text-white/60 text-base leading-relaxed">
                Your selfie video has been uploaded successfully. Our team will review it and get back to you.
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
