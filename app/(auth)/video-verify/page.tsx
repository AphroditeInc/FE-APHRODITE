"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { Video, CheckCircle, Camera, Square } from "lucide-react";

export default function VideoVerifyPage() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'recording' | 'completed'>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      // Try back camera first
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user', // Use front camera for selfie video
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true // Enable audio for video recording
        });
      } catch (backCameraError) {
        console.log('Front camera failed, trying any camera...');
        // Fallback to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: true
        });
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      // Wait for video to be ready before setting srcObject
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video metadata to load
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        };
        
        // Add error handling for video
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setIsCameraActive(false);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const startRecording = () => {
    if (stream && videoRef.current) {
      setIsRecording(true);
      setCurrentStep('recording');
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
        setCurrentStep('completed');
        stopCamera();
      };
      
      mediaRecorder.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleContinue = () => {
    // Set video verification completed in localStorage
    localStorage.setItem('videoVerificationCompleted', 'true');
    // Go back to select verification method page with video verification status
    window.location.href = "/id-verification?videoVerified=true";
  };

  const handleBack = () => {
    // Go back to ID verification page
    window.history.back();
  };

  const handleRetry = () => {
    setRecordedVideo(null);
    setIsRecording(false);
    setCurrentStep('setup');
  };

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-start camera when setup step is active
  useEffect(() => {
    if (currentStep === 'setup' && !isCameraActive) {
      startCamera();
    }
  }, [currentStep, isCameraActive, stopCamera]);

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard
          title="Video Proof Setup"
          description="Position yourself in the frame and prepare to record your selfie video"
        >
          <div className="space-y-8">
            
            {/* Camera Preview Area */}
            <div className="bg-white/5 rounded-[20px] p-8 text-center border border-white/10">
              {isCameraActive && stream ? (
                <div className="w-80 h-60 bg-gray-800 rounded-lg mx-auto mb-4 overflow-hidden relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                  />
                  {!stream.active && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-white/60 text-xs">Starting camera...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-80 h-60 bg-gray-800 rounded-lg mx-auto mb-4 flex flex-col items-center justify-center">
                  <Camera className="w-12 h-12 text-white/40 mb-2" />
                  <Button
                    onClick={startCamera}
                    size="sm"
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    Start Camera
                  </Button>
                </div>
              )}
              <p className="text-white/60 text-sm mb-4">
                {isCameraActive ? "Position yourself in the frame above" : "Click 'Start Camera' to begin"}
              </p>
            </div>

            {/* Camera Controls */}
            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              
              <Button
                onClick={startRecording}
                disabled={!isCameraActive}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
        <AuthCard
          title="Recording Video Proof"
          description="Recording in progress... Please speak clearly and show your face"
        >
          <div className="space-y-8">
            
            {/* Recording Preview */}
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
              <div className="text-center mb-4">
                <h3 className="text-white text-lg font-semibold mb-2">Recording...</h3>
                <p className="text-white/60 text-sm">Please speak clearly and show your face</p>
              </div>
              
              {stream && (
                <div className="w-full h-64 bg-gray-800 rounded-lg overflow-hidden mb-4 relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Recording Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-medium">REC</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                onClick={stopRecording}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </div>

            {/* Recording Tips */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Recording Tips:</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Speak clearly and naturally</li>
                <li>• Show your full face in the frame</li>
                <li>• Keep the recording under 30 seconds</li>
                <li>• Say: &quot;I am [Your Name] and I confirm my identity&quot;</li>
              </ul>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="relative bg-white/6 backdrop-blur-md rounded-[24px] w-[586px] py-[40px] mx-4 text-white border border-white/20 font-urbanist">
          <div className="h-full flex flex-col justify-center w-[386px] mx-auto">
            
            {/* Logo */}
            <div className="flex justify-center items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
                <span className="text-pink-500 text-xl font-bold">Aphrodite</span>
              </div>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-4 border-green-500">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">Video Proof Recorded!</h2>
              <p className="text-white/60 text-base leading-relaxed">
                Your selfie video has been recorded successfully. We will review and get back to you.
              </p>
            </div>

            {/* Video Preview */}
            {recordedVideo && (
              <div className="mb-6">
                <video
                  src={recordedVideo}
                  controls
                  className="w-full h-32 bg-gray-800 rounded-lg"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-4">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex-1"
              >
                Retake
              </Button>
              
              <Button
                onClick={handleContinue}
                className="flex-1 bg-pink-600 hover:bg-pink-700"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

