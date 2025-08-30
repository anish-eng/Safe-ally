import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Save, Calendar, Lock, Heart, Trash2, Play, Pause, Volume2 } from 'lucide-react';
import { db, storage } from "../firebase/firebaseConfig";
import { collection, addDoc, Timestamp,doc,getDoc ,serverTimestamp} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { toast } from 'react-toastify';
import JournalList from './JournalList';


const SafeHavenJournal = () => {
  const [journalText, setJournalText] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const auth = getAuth();
   const user = auth.currentUser;
   console.log("the userdisplayname is",user.displayName,user)
  //  for current loggedin user

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [journalText]);
  useEffect(() => {
    const fetchDisplayName = async () => {
      try {
       
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          const userRef = doc(db, "users", user.uid); 
          console.log('useruid*****',user.uid)
         // path to your Firestore doc
          const docSnap = await getDoc(userRef);
          if (docSnap.data()) {
            setDisplayName(docSnap.data().displayName);
          } else {
          }
        }
      } catch (error) {
        console.error("Error fetching user displayName:", error);
      }
    };
  
    fetchDisplayName();
  }, []);
  const handleTextChange = (e) => {
    setJournalText(e.target.value);
  };
  const sanitizeFilename = (name) => {
    return name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\s+/g, "_");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const mediaUploads = await Promise.all(
        
        uploadedImages.map(async (media) => {
          const fileType = media.type === "image" ? "images" : "videos";
          const fileRef = ref(storage, `${fileType}/${sanitizeFilename(media.name)}-${Date.now()}`);
          const blob = await fetch(media.url).then((res) => res.blob());
          await uploadBytes(fileRef, blob);
          const downloadURL = await getDownloadURL(fileRef);
  
          return {
            type: media.type,
            name: media.name,
            url: downloadURL,
          };
        })
      );
  
      let audioUrlInStorage = null;
      if (audioBlob) {
        const audioRef = ref(storage, `audio/audio-${Date.now()}.webm`);
        await uploadBytes(audioRef, audioBlob);
        audioUrlInStorage = await getDownloadURL(audioRef);
      }
      const docRef = await addDoc(collection(db, "journalEntries"), {
        text: journalText,
        createdAt: Timestamp.now(),
        audio: audioUrlInStorage,
        media: mediaUploads,
        email:user.email
      });

      console.log("docref",docRef)
      setSaving(false);
      toast.success("Your Journal entry saved successfully!");
  
      setJournalText("");
      setAudioBlob(null);
      setAudioUrl(null);
      setUploadedImages([]);
    } catch (error) {
      setSaving(false);
      toast.error("❌ Failed to save journal entry. Try again.");
    }
  };
  

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name,
            type: file.type.startsWith("video/") ? "video" : "image", 
            file: file
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const deleteAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6"  >
  <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] text-center pb-2">
    Hello {displayName}! Welcome to Safe Ally
  </h1>

  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6 mb-6 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
<div
  className="w-12 h-12 aspect-square rounded-xl
             bg-gradient-to-r from-blue-500 to-pink-500
             flex items-center justify-center
             ring-1 ring-indigo-200/60 shadow-sm
             shrink-0 flex-none"
>
  <img
    src="/translogo.png"                    
    alt="SafeHaven logo"
    className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
    draggable="false"
  />
</div>
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Create a Journal Entry</h1>
            <p className="text-sm text-gray-600">Your private journal space to pen down your thoughts...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6">
      <div className="flex items-center mb-4 space-x-2 text-[#1e3a8a]">
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">
          Your entries are encrypted and private
        </span>
      </div>
      <div className="relative mb-6">
        <textarea
          ref={textareaRef}
          value={journalText}
          onChange={handleTextChange}
          placeholder="Share your thoughts, feelings, or what happened today..."
          className="w-full min-h-[300px] p-5 pb-36 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 placeholder-gray-400 text-base leading-relaxed"
        />
        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 bg-[#1e3a8a] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:scale-105 transform transition w-full sm:w-auto"
          >
            <Camera className="w-4 h-4" />
            <span>Add Photos/Videos</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*,video/*"
            multiple
            className="hidden"
          />

          {/* Voice Note */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto ${
              isRecording
                ? 'bg-red-500 text-white'
                : ' bg-[#8789C0] text-white'
            }`}
            // gray-500 text
          >
            <Mic className="w-4 h-4" />
            <span>{isRecording ? 'Stop Recording' : 'Add Voice Note'}</span>
          </button>
        </div>
      </div>
{audioUrl && (
  <div className="mb-6">
    <div className="flex items-center gap-3 p-3 rounded-xl border border-purple-300 bg-gray-900 w-full sm:max-w-md">
      <audio
        src={audioUrl}
        controls
        preload="metadata"
        playsInline
        className="flex-1 min-w-0 h-10  invert"  
      />
      <button onClick={deleteAudio} className="text-sm text-red-300 hover:text-red-200">
        Remove
      </button>
    </div>
  </div>
)}
      {uploadedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {uploadedImages.map((media, index) => (
            <div key={index} className="relative group">
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={`Uploaded ${index}`}
                  className="w-full h-28 object-cover rounded-md border border-gray-300"
                />
              ) : (
                <video
                  controls
                  src={media.url}
                  className="w-full h-28 object-cover rounded-md border border-gray-300"
                />
              )}
              <button
                onClick={() => removeImage(media.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="text-center">
        <button
          onClick={handleSave}
          className=" bg-gradient-to-r from-blue-500 to-pink-500 text-white  px-6 py-3 mt-6 rounded-xl font-medium hover:scale-105 transform transition w-full sm:w-auto"
        >
          <Save className="inline w-5 h-5 mr-2" />
          {saving ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </div>
  </div>
</div>


    
    </>

  );
};

export default SafeHavenJournal;
