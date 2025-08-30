import React, { useState, useEffect } from 'react';
import { Folder, File, ArrowLeft, Plus, Upload, Trash2, Home, FolderPlus, FileText, Image, FileAudio, X, MoreVertical, Loader,Download } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL,deleteObject,getStorage, getBlob  } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";



// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   addDoc,
//   deleteDoc,
//   doc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import { db } from './firebase';


// // Mock Firebase Implementation
// // In your real app, you would use actual Firebase imports
// class MockFirebaseDB {
//   constructor() {
//     // Simulate a database with localStorage
//     this.data = this.loadData();
//     this.listeners = [];
//   }

//   loadData() {
//     try {
//       const saved = localStorage.getItem('fileVaultData');
//       return saved ? JSON.parse(saved) : {};
//     } catch {
//       return {};
//     }
//   }

//   saveData() {
//     try {
//       localStorage.setItem('fileVaultData', JSON.stringify(this.data));
//     } catch (e) {
//       console.error('Failed to save data:', e);
//     }
//   }

//   // Get items for a specific user and folder
//   getItems(userId, parentId = null) {
//     const userKey = `user_${userId}`;
//     if (!this.data[userKey]) {
//       this.data[userKey] = { items: [] };
//     }
//     return this.data[userKey].items.filter(item => item.parentId === parentId);
//   }

//   // Add a new item
//   async addItem(userId, itemData) {
//     const userKey = `user_${userId}`;
//     if (!this.data[userKey]) {
//       this.data[userKey] = { items: [] };
//     }
    
//     const newItem = {
//       id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       ...itemData,
//       createdAt: new Date().toISOString()
//     };
    
//     this.data[userKey].items.push(newItem);
//     this.saveData();
//     this.notifyListeners(userId);
//     return newItem;
//   }

//   // Delete an item
//   async deleteItem(userId, itemId) {
//     const userKey = `user_${userId}`;
//     if (this.data[userKey]) {
//       this.data[userKey].items = this.data[userKey].items.filter(item => item.id !== itemId);
//       this.saveData();
//       this.notifyListeners(userId);
//     }
//   }

//   // Subscribe to changes
//   subscribe(userId, parentId, callback) {
//     const listener = { userId, parentId, callback };
//     this.listeners.push(listener);
    
//     // Immediately call with current data
//     callback(this.getItems(userId, parentId));
    
//     // Return unsubscribe function
//     return () => {
//       this.listeners = this.listeners.filter(l => l !== listener);
//     };
//   }

//   // Notify all relevant listeners
//   notifyListeners(userId) {
//     this.listeners.forEach(listener => {
//       if (listener.userId === userId) {
//         listener.callback(this.getItems(userId, listener.parentId));
//       }
//     });
//   }
// }

// // Create a single instance
// const mockDB = new MockFirebaseDB();
// ********testing the mock db here


// firebaseDB.js
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
// import { db } from "../firebase/firebaseConfig";
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


// Mock auth - in real app, this would come from Firebase Auth
// const mockAuth = {
//   currentUser: { uid: 'demo_user_123' }
// };

const FileVault = () => {
  // STEP 1: State Management
  // These are like variables that React watches for changes
  
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
  
  // STEP 2: Firebase Real-time Listener (Simulated)
  // This watches for changes in Firebase and updates our UI automatically
  useEffect(() => {
    setLoading(true);
   
    
    // Subscribe to changes for current folder
    const unsubscribe = firebaseDB.subscribe(userId, currentFolderId, (updatedItems) => {
      console.log("Updated items ******* ",updatedItems)
      setItems(updatedItems);
      setLoading(false);
    });

    // Cleanup function - stops listening when component unmounts or folder changes
    return () => unsubscribe();
  }, [currentFolderId, userId]);  // Re-run when these change

  // STEP 3: Folder Navigation Functions
  
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

  // STEP 5: Delete Item
  // const deleteItem = async (item) => {
  //   // if (!confirm(`Delete ${item.name}?`)) return;

  //   try {
  //     await firebaseDB.deleteItem(userId, item.id);
  //     setSelectedItem(null);
  //   } catch (error) {
  //     console.error('Error deleting item:', error);
  //     alert('Failed to delete item');
  //   }
  // };

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


  // STEP 6: File Upload (Simplified for demo)
  // const handleFileUpload = async (event) => {
  //   const files = event.target.files;
  //   if (!files || files.length === 0) return;

  //   for (const file of files) {
  //     try {
  //       // In real app, you'd upload the actual file to Firebase Storage
  //       // For demo, we just store metadata
  //       await firebaseDB.addItem(userId, {
  //         name: file.name,
  //         type: 'file',
  //         size: file.size,
  //         parentId: currentFolderId,
  //         // In real app: downloadURL would point to Firebase Storage
  //       });
  //     } catch (error) {
  //       console.error('Error uploading file:', error);
  //       alert(`Failed to upload ${file.name}`);
  //     }
  //   }
    
  //   setShowUploadDialog(false);
  //   event.target.value = '';  // Reset file input
  // };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
  
    for (const file of files) {
      try {
        console.log('Uploading file:', file.name);
        
        // 1. Create a unique path for the file in Firebase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const storagePath = `users/${userId}/files/${fileName}`;
        const storageRef = ref(storage, storagePath);
        const metadata = {
          contentDisposition: `attachment; filename="${file.name}"`,
        };
        
        // 2. Upload the actual file to Firebase Storage
        console.log('Uploading to Storage...');
        const uploadResult = await uploadBytes(storageRef, file,metadata);
        
        // 3. Get the download URL for the uploaded file
        console.log('Getting download URL...');
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log('downloadurl')
        
        // 4. Save file metadata to Firestore (with real download URL)
        console.log('Saving metadata to Firestore...');
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
        
        console.log('File uploaded successfully:', file.name);
        
      } catch (error) {
        console.error('Error uploading file:', error);
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

  // const downloadFile = async (file) => {
  //   try {
  //     if (!file.downloadURL) {
  //       alert('File download URL not available');
  //       return;
  //     }
  
  //     const filename = file.name || 'downloaded_file';
  //     console.log('Downloading file:', filename);
  
  //     // 🔗 Force download behavior by appending content-disposition to the URL
  //     const forcedUrl = `${file.downloadURL}&response-content-disposition=attachment%3B%20filename%3D${encodeURIComponent(filename)}`;
  //     console.log('forcedurl',forcedUrl)
  //     window.location.assign(forcedUrl);
  //     // 🖼️ Create hidden iframe instead of anchor tag
  //     const iframe = document.createElement('iframe');
  //     iframe.style.display = 'none';
  //     iframe.style.width = '300px';
  //     iframe.style.height = '200px';
  //     iframe.style.border = '1px solid red';
  //     iframe.src = forcedUrl; 
      
  //     iframe.onload = () => {
  //       console.log('Iframe loaded!');
  //     };
      
  //     iframe.onerror = (error) => {
  //       console.error('Iframe error:', error);
  //     };// Point iframe to the download URL
  
  //     // 🚀 Add iframe to page (this triggers the download)
  //     document.body.appendChild(iframe);
  
  //     console.log('Download triggered successfully:', filename);
  
  //     // 🧹 Clean up iframe after download starts
  //     setTimeout(() => {
  //       if (document.body.contains(iframe)) {
  //         document.body.removeChild(iframe);
  //         console.log('Iframe cleaned up for:', filename);
  //       }
  //     }, 9000); // Remove after 5 seconds
  
  //   } catch (error) {
  //     console.error('Download failed:', error);
  //     alert(`Failed to download ${file.name || 'file'}: ${error.message}`);
  //   }
  // };



  const downloadFile = (file) => {
    try {
      if (!file.downloadURL) {
        alert('File download URL not available');
        return;
      }
  
      const filename = file.name || 'downloaded_file';
  
      // 🔐 Firebase signed URLs support response header overrides
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
  
  







  
 
  
  // STEP 8: The UI (User Interface)
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      {/* <div className="border-b px-6 py-4">
        <h2 className="text-2xl font-semibold text-gray-800">Secure File Vault</h2>
        <p className="text-sm text-gray-600 mt-1">Your files are encrypted and protected</p>
        <p className="text-xs text-gray-500 mt-1">(Demo mode - using local storage instead of Firebase)</p>
      </div> */}

      {/* Toolbar */}
      <div className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
          <h1>A place where you can securely store your valuable documents!</h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </button>
          
          <button
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="px-6 py-3 flex items-center space-x-2 text-sm overflow-x-auto">
      {/* console.log('pathitem',index,pathItem) */}
        {currentPath.map((pathItem, index) => (
          
          <React.Fragment key={pathItem.id || 'root'}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <button
              onClick={() => navigateToPath(index)}
              className="text-blue-600 hover:underline whitespace-nowrap"
            >
              {pathItem.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* File List */}
      <div className="px-6 py-4 min-h-[400px]">
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
                onClick={() => setSelectedItem(item)}
                onDoubleClick={() => item.type === 'folder' && navigateToFolder(item)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {item.type === 'folder' ? (
                    <Folder className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <div className="text-gray-600 flex-shrink-0">{getFileIcon(item.name)}</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.name}</p>
                    {item.type === 'file' && (
                      <p className="text-sm text-gray-500">{formatFileSize(item.size)}</p>
                    )}
                  </div>
                </div>
                {/* {item.type === 'file' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadFile(item);
          }}
          className="p-2 text-green-600 hover:bg-green-50 rounded"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      )} */}    
                <div className="flex items-center space-x-2 flex-shrink-0">
                {item.type === 'file' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(item);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
      
                  {selectedItem?.id === item.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>This folder is empty</p>
                <p className="text-sm mt-1">Create a new folder or upload files to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createNewFolder()}
              autoFocus
            />
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createNewFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
              >
                Choose Files
              </label>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowUploadDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Info Box */}
      <div className="border-t px-6 py-4 bg-gray-50">
        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">How to upload documents:</p>
          <ul className="space-y-1 text-xs">
            <li>• Create folders by clicking "New Folder"</li>
            <li>• Navigate by double-clicking folders</li>
            <li>• Upload files </li>
            <li>• Select items and click on the delete icon.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileVault;
