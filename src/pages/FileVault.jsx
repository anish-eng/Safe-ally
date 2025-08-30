import React, { useState, useEffect } from 'react';
import { Folder, File, ArrowLeft, Plus, Upload, Trash2, Home, FolderPlus, FileText, Image, FileAudio, Loader,Download , Calendar} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL,deleteObject,getStorage, getBlob  } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";




import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

import { getAuth } from "firebase/auth";


class FirebaseDB {
  // Get items for a specific user and folder
  getItems(userId, parentId = null, callback) {
    const itemsRef = collection(db, 'vault_items');
    const q = query(itemsRef,
      where('userId', '==', userId),
      where('parentId', '==', parentId || null)
    );
    console.log('itemsref',itemsRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('items is ',items)
      callback(items);
    });

    return unsubscribe;
  }

  // Add a new item
  async addItem(userId, itemData) {
    const newItem = {
      ...itemData,
      userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'vault_items'), newItem);
    console.log('docref.id, newitem',docRef.id,newItem)
    return { id: docRef.id, ...newItem };
  }

  // Delete an item
  async deleteItem(userId, itemId) {
    const itemRef = doc(db, 'vault_items', itemId);
    await deleteDoc(itemRef);
  }

  // Subscribe (mimics mockDB.subscribe)
  subscribe(userId, parentId, callback) {
    return this.getItems(userId, parentId, callback);
  }
}


const firebaseDB = new FirebaseDB();



const FileVault = () => {

  
  const [items, setItems] = useState([]);  // All files and folders from Firebase
  const [currentFolderId, setCurrentFolderId] = useState(null);  // Which folder we're viewing (null = root)
  const [currentPath, setCurrentPath] = useState([{ id: null, name: 'My Vault' }]);  // Breadcrumb trail
  const [loading, setLoading] = useState(true);  // Shows loading spinner
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  // Get user ID from mock auth
  console.log("user is *********",user)
  const userId = user.uid;
  
 
  useEffect(() => {
    setLoading(true);
   
    
    
    const unsubscribe = firebaseDB.subscribe(userId, currentFolderId, (updatedItems) => {
      console.log("Updated items ******* ",updatedItems)
      setItems(updatedItems);
      setLoading(false);
    });

    
    return () => unsubscribe();
  }, [currentFolderId, userId]);  // Re-run when these change


  
  const navigateToFolder = async (folder) => {
    console.log('folder is',folder)
    // Add to path (breadcrumbs)
    setCurrentPath([...currentPath, { id: folder.id, name: folder.name }]);
    // Change current folder
    console.log('currentpath changed',currentPath)
    setCurrentFolderId(folder.id);
    // Clear selection
    setSelectedItem(null);
  };

  const navigateBack = () => {
    if (currentPath.length > 1) {
      // Remove last item from path
      const newPath = currentPath.slice(0, -1);
      console.log('newpath after navitgating back',newPath)
      setCurrentPath(newPath);
      // Set folder to parent
      console.log('currentpath,selectedItem',currentPath,selectedItem)
      setCurrentFolderId(newPath[newPath.length - 1].id);
      setSelectedItem(null);
    }
  };



  const navigateToPath = (index) => {
    // Jump to specific folder in breadcrumb
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
    console.log('currentfolderid',currentFolderId)
    setSelectedItem(null);
  };

  // STEP 4: Create New Folder
  const createNewFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await firebaseDB.addItem(userId, {
        name: newFolderName,
        type: 'folder',
        parentId: currentFolderId
      });

      // Reset dialog
      setShowNewFolderDialog(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };


  const deleteItem = async (item) => {
    try {
      // 1. Delete from Firestore
      await firebaseDB.deleteItem(userId, item.id);
      
      // 2. If it's a file with storage path, delete from Storage too
      if (item.type === 'file' && item.storagePath) {
        try {
          const storageRef = ref(storage, item.storagePath);
          await deleteObject(storageRef);
          console.log('File deleted from Storage:', item.storagePath);
        } catch (storageError) {
          console.warn('Failed to delete from storage:', storageError);
          // Continue anyway - Firestore record is deleted
        }
      }
      
      setSelectedItem(null);
      console.log('Item deleted successfully:', item.name);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };


  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
  
    for (const file of files) {
      try {
        
        // 1. Create a unique path for the file in Firebase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const storagePath = `users/${userId}/files/${fileName}`;
        const storageRef = ref(storage, storagePath);
        const metadata = {
          contentDisposition: `attachment; filename="${file.name}"`,
        };
        
        // 2. Upload the actual file to Firebase Storage
    
        const uploadResult = await uploadBytes(storageRef, file,metadata);
        
        // 3. Get the download URL for the uploaded file
        
        const downloadURL = await getDownloadURL(uploadResult.ref);
  
        
        // 4. Save file metadata to Firestore (with real download URL)
        
        await firebaseDB.addItem(userId, {
          name: file.name,
          type: 'file',
          size: file.size,
          parentId: currentFolderId,
          downloadURL: downloadURL,        // 🎯 REAL download URL
          storagePath: storagePath,        // 🎯 Storage path for deletion
          mimeType: file.type,             // 🎯 File type
          uploadedAt: new Date().toISOString()
        });
        
       
        
      } catch (error) {
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    setShowUploadDialog(false);
    event.target.value = '';  // Reset file input
  };

  // STEP 7: Helper Functions
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <Image className="w-5 h-5" />;
    if (['mp3', 'wav', 'm4a'].includes(ext)) return <FileAudio className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };




  const downloadFile = (file) => {
    try {
      if (!file.downloadURL) {
        alert('File download URL not available');
        return;
      }
  
      const filename = file.name || 'downloaded_file';
  

      const downloadUrl = `${file.downloadURL}&response-content-disposition=attachment%3B%20filename%3D${encodeURIComponent(filename)}`;
  
      // 🧲 Create a hidden anchor tag and trigger it
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      console.log('Download triggered:', filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download ${file.name}: ${error.message}`);
    }
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
    alt="Safe Ally logo"
    className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
    draggable="false"
  />
</div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">File Vault</h1>
            <p className="text-sm text-gray-600">Your own file storage system- Store your sensitive documents and files...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
  </div>
</div>

  
  <div className="w-full px-2 sm:px-0 overflow-x-hidden"  >
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden min-w-0">

      {/* Toolbar */}
      <div className="border-b px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:justify-between">
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 min-w-0">
          <button
            onClick={navigateBack}
            disabled={currentPath.length === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setCurrentPath([{ id: null, name: 'My Vault' }]);
              setCurrentFolderId(null);
            }}
            className="p-2 rounded hover:bg-gray-100"
            title="Go to root"
          >
            <Home className="w-5 h-5" />
          </button>

          <h1 className="text-sm sm:text-base font-medium text-gray-800 max-w-full sm:max-w-none break-words sm:truncate">
            A place where you can securely store your valuable documents!
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="flex items-center justify-center px-3 py-2 bg-[#1e3a8a] text-white rounded hover:bg-[#1e3a8a] w-full sm:w-auto"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </button>

          <button
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center justify-center px-3 py-2 bg-[#8789C0] text-white rounded hover:bg-[#8789C0] w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </button>
        </div>
      </div>

      {/* Breadcrumb (scrolls horizontally on mobile) */}
      {/* <div className="px-3 sm:px-6 py-3 flex items-center space-x-2 text-sm overflow-x-auto whitespace-nowrap"> */}
      <div className="px-3 sm:px-6 py-3 flex flex-wrap items-center gap-2 text-sm whitespace-normal sm:whitespace-nowrap sm:overflow-x-auto pr-3">
        {currentPath.map((pathItem, index) => (
          <React.Fragment key={pathItem.id || 'root'}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <button
              onClick={() => navigateToPath(index)}
              className="text-[#1e3a8a] hover:underline"
            >
              {pathItem.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* File List */}
      <div className="px-3 sm:px-6 py-4 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors ${
                  selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                }`}
                // onClick={() => setSelectedItem(item)}
                onClick={() => {
                  if (item.type === "folder") {
                    navigateToFolder(item); // open folder on tap
                  } else {
                    setSelectedItem(item); // select file
                  }
                }}
                // onDoubleClick={() => item.type === 'folder' && navigateToFolder(item)}
              >
            
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.type === 'folder' ? (
                    <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-#1e3a8a flex-shrink-0" />
                  ) : (
                    <div className="text-gray-600 flex-shrink-0">{getFileIcon(item.name)}</div>
                  )}
                  <div className="min-w-0">
                    {/* <p className="font-medium text-gray-800 truncate text-sm sm:text-base">{item.name}</p> */}
                    <p className="font-medium text-gray-800 break-all sm:truncate sm:max-w-[28ch]">{item.name}</p>
                  
                    {item.type === 'file' && (
                      <p className="text-xs sm:text-sm text-gray-500">{formatFileSize(item.size)}</p>
                    )}
                  </div>

                 
                 </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {item.type === 'file' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(item);
                      }}
                      className="p-2 text- #1e3a8a  rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {/* {selectedItem?.id === item.id && ( */}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item);
                      }}
                      className="p-2 text-#8789C0  rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                  {/* )} */}

                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-3 text-#1e3a8a" />
                <p>This folder is empty</p>
                <p className="text-sm mt-1">Create a new folder or upload files to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-lg p-5 w-full max-w-sm sm:w-96 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-[#1e3a8a]">Create New Folder</h3>

            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && createNewFolder()}
              autoFocus
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-[#8789C0]rounded w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={createNewFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-[#1e3a8a] text-white rounded hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-lg p-5 w-full max-w-sm sm:w-96 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Upload Files</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2 text-sm sm:text-base">Drop files here or click to browse.</p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-[#1e3a8a] text-white rounded cursor-pointer hover:bg-[#1e3a8a]"
              >
                Choose Files
              </label>
            </div>

            
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="border-t px-3 sm:px-6 py-4 bg-white">
        <div className="text-sm text-[#1e3a8a]">
          <p className="font-semibold mb-2">How to upload documents:</p>
          <ul className="space-y-1 text-xs sm:text-sm">
            <li>• Create folders by clicking “New Folder”.</li>
            <li>• Navigate by double-clicking folders.</li>
            <li>• Upload files.</li>
            <li>• Select items and click on the delete icon.</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
  </>
);

};

export default FileVault;
