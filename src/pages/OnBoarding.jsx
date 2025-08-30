import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // <-- your initialized Firestore
import { UserRoundPlus,Calendar } from "lucide-react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'react-toastify';




export default function OnboardingPage() {
   
 
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    relationship: "",
   contactmethod: "",
  });
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);
  const ref = useMemo(
    () => (userId ? doc(db, "users", userId, "profile", "emergencyContact") : null),
    [userId]
  );
  const ref2 = useMemo(
    () => (userId ? doc(db, "users", userId) : null),
    [userId]
  );

  // Load existing contact -> prefill
  useEffect(() => {
    console.log("entered the prefilluseeffect")
    console.log('rpinting the form data at this time',form)
    if (!userId) {
      console.warn("EmergencyContactForm: no userId yet — not loading Firestore.");
      setHasExisting(false);
      setLoading(false);              // <-- important: stop loading if not signed in yet
      return;
    }
    if (!ref) return;
  
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setForm({
            fullName: d.fullName || "",
            phone: d.phone || "",
            email: d.email || "",
            relationship: d.relationship || "",
            contactmethod: d.contactmethod || "",
          });
          setHasExisting(true);
        } else {
          setHasExisting(false);
        }
      } catch (err) {
        console.error("Failed to load emergency contact:", err);
        setHasExisting(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, ref]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Add / Update Firestore
  const save = async (e) => {
    e.preventDefault();
    console.log("entered the funciton atleast")
    console.log("userid",userId)
    console.log('name,phone',form.fullName,form.phone)

    if (!userId) return;
    if (!form.fullName.trim() || !form.phone.trim()) return;
    
    console.log('entered here atleast, or maybe this is not valled ')
    setSaving(true);
    try {
      await setDoc(
        ref,
        {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: (form.email || "").trim(),
          relationship: (form.relationship || "").trim(),
          contactmethod: (form.contactmethod || "").trim(),
          updatedAt: serverTimestamp(),
          
        },
        { merge: true }

      
        
      );
      await setDoc(
        ref2,{
          onboardingComplete:true
        },
        { merge: true }
        
      )
      console.log("this is after the setting save the document")
      setHasExisting(true);
      toast.success("Your Emergency contact was saved successfully!")

    //   onSaved?.(form);
    } finally {
      setSaving(false);
      console.log("setsaving =false")
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded-full mb-4" />
        <div className="h-4 w-64 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded md:col-span-2" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
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
    src="/translogo.png"                       /* or import + use logoUrl */
    alt="SafeHaven logo"
    className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
    draggable="false"
  />
</div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Add/Edit Emergency Contact</h1>
            <p className="text-sm text-gray-600">Add your Emergency Contact here- You can email this contact during an emergency...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
  </div>
</div>
   

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-4xl mx-auto mt-10" >
      {/* Header pill */}
      <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8789C0] text-white">
          <UserRoundPlus size={18} className="shrink-0" />
          <span className="text-sm font-semibold">Emergency Contact</span>
        </div>
        <span className="text-xs text-gray-500">
          {hasExisting ? "Existing contact loaded" : "No contact set"}
        </span>
      </div>

      <p className="text-sm text-gray-500 px-5 pt-2">
        Please add your emergency contact details, we recommend you to do this so you can contact them in the case of an emergency. Your data is safe with us
      </p>

      {/* Form */}
      <form onSubmit={save} className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Emergency Contact name </label>
            <input
              name="fullName"
              required
              value={form.fullName ?? ""}
              onChange={onChange}
              placeholder="John Doe"
              
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone *</label>
            <input
            required
              name="phone"
              type="tel"
              value={form.phone ?? ""}
              onChange={onChange}
              placeholder="+1 555-123-4567"
              
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

      
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
            required
              name="email"
              type="email"
              value={form.email ?? ""}
              onChange={onChange}
              placeholder="john@example.com"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            <input
              name="relationship"
              value={form.relationship ?? ""}
              onChange={onChange}
              placeholder="Parent, sibling, friend"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

       
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Method</label>
            <select
  name="contactmethod"
  required
  value={form.contactmethod}
  onChange={onChange}
  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
>
  <option value="">Select contact method</option>
  <option value="email">Email</option>
  {/* <option value="sms">SMS</option> */}
</select>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <span className="text-xs text-gray-500">We’ll only use this in emergencies.</span>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() =>
                setForm({ fullName: "", phone: "", email: "", relationship: "", contactmethod: "" })
              }
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white bg-[#8789C0] border border-bg-[#8789C0] hover:bg-[#8789C0] w-full sm:w-auto"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={saving }
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold text-white
                         bg-[#1e3a8a] text-white hover:opacity-95
                         focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-60 w-full sm:w-auto"
            >
              {saving ? "Saving…" : hasExisting ? "Save Changes" : "Save Contact"}
            </button>
          </div>
        </div>
      </form>
    </div>
    </>
  );
}


