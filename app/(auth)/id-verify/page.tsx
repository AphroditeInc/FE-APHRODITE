"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, CheckCircle, Camera } from "lucide-react";
import Image from "next/image";

export default function IDVerifyPage() {
  const [currentStep, setCurrentStep] = useState<'capture' | 'verification' | 'completed'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setCurrentStep('verification');
    }
  };

  const startCamera = async () => {
    try {
      // Try back camera first
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (backCameraError) {
        console.log('Back camera failed, trying front camera...');
        // Fallback to front camera
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
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

  const handleCaptureImage = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        
        // Stop camera after capture
        stopCamera();
        setCurrentStep('verification');
      }
    }
  };

  const handleVerification = () => {
    setIsUploading(true);
    // Simulate verification process
    setTimeout(() => {
      setIsUploading(false);
      setCurrentStep('completed');
    }, 2000);
  };

  const handleContinue = () => {
    // Go back to select verification method page with verification status
    window.location.href = "/id-verification?verified=true";
  };

  const handleBack = () => {
    // Go back to ID verification page
    window.history.back();
  };


  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-start camera when capture step is active
  useEffect(() => {
    if (currentStep === 'capture' && !isCameraActive) {
      startCamera();
    }
  }, [currentStep, isCameraActive, stopCamera]);

  if (currentStep === 'capture') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard
          title="Capture ID Image"
          description="Position your government ID within the frame and take a clear photo"
        >
          <div className="space-y-8">
            
            {/* Camera Preview Area */}
            <div className="bg-white/5 rounded-[20px] p-8 text-center border border-white/10">
              {isCameraActive && stream ? (
                <div className="w-64 h-40 bg-gray-800 rounded-lg mx-auto mb-4 overflow-hidden relative">
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
                <div className="w-64 h-40 bg-gray-800 rounded-lg mx-auto mb-4 flex flex-col items-center justify-center">
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
                {isCameraActive ? "Position your ID card in the frame above" : "Click 'Start Camera' to begin"}
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
                onClick={handleCaptureImage}
                disabled={!isCameraActive}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Image
              </Button>
            </div>

            {/* Alternative Upload */}
            <div className="text-center">
              <p className="text-white/60 text-sm mb-3">Or upload from device</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="id-upload"
              />
              <label htmlFor="id-upload">
                <Button
                  variant="outline"
                  size="md"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </label>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (currentStep === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthCard
          title="Verify ID Image"
          description="Review your captured image and proceed with verification"
        >
          <div className="space-y-8">
            
            {/* Captured Image Display */}
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
              <div className="text-center mb-4">
                <h3 className="text-white text-lg font-semibold mb-2">Captured Image</h3>
                <p className="text-white/60 text-sm">Review the image below</p>
              </div>
              
              {capturedImage && (
                <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden mb-4 relative">
                  <Image 
                    src={capturedImage} 
                    alt="Captured ID" 
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {uploadedFile && (
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-white/60 text-xs">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep('capture')}
                variant="outline"
                className="flex-1"
              >
                Retake
              </Button>
              
              <Button
                onClick={handleVerification}
                disabled={isUploading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify & Submit'
                )}
              </Button>
            </div>

            {/* Verification Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Verifying ID...</span>
                  <span>Processing</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full transition-all duration-1000 animate-pulse"></div>
                </div>
                <div className="text-center text-white/60 text-sm">
                  Please wait while we process your document...
                </div>
              </div>
            )}
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
              <h2 className="text-2xl font-bold mb-3">ID Submitted Successfully</h2>
              <p className="text-white/60 text-base leading-relaxed">
                Well-done! Your government-issued ID has been captured and submitted successfully. We will review and get back to you.
              </p>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              fullWidth
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AuthCard
        title="Government ID Verification"
        description="Upload a government-issued ID to verify your identity. Supported formats: JPG, PNG, PDF (max 10MB)"
      >
        <div className="space-y-8">
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-white/20 rounded-[20px] p-8 text-center hover:border-pink-500/50 transition-colors">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="id-upload"
              disabled={isUploading}
            />
            <label htmlFor="id-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                  {isUploading ? (
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-pink-500" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {isUploading ? "Uploading..." : "Click to upload your ID"}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {isUploading 
                      ? "Please wait while we process your document..."
                      : "Drag and drop your ID here, or click to browse"
                    }
                  </p>
                </div>

                {uploadedFile && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-white/60 text-xs">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Camera Option */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-3">Or use your camera</p>
            <Button
              onClick={handleCaptureImage}
              variant="outline"
              size="md"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            
            {uploadedFile && !isUploading && (
              <Button
                onClick={() => setCurrentStep('verification')}
                className="flex-1"
              >
                Continue to Verification
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Uploading...</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </div>
      </AuthCard>
    </div>
  );
}
