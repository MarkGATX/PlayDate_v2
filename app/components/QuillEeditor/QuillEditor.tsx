// import { useEffect, useMemo, useRef, useState } from 'react';
// import ReactQuill, { UnprivilegedEditor } from 'react-quill';
// //some styles overridden in global.css
// import 'react-quill/dist/quill.snow.css';
// import { Delta } from 'quill/core';
// import Sources from 'quill';
// import supabaseClient from '@/utils/supabase/client';

// interface QuillEditorProps {
//   content: Delta | undefined;
//   playdateID: string;
//   setOpenNoteEditor: (newState: boolean) => void;
//   openNoteEditor: boolean
// }

// const QuillEditor: React.FC<QuillEditorProps> = ({ content, playdateID, setOpenNoteEditor, openNoteEditor }) => {
//   // export default function QuillEditor(content?:Delta) {
//   const [noteContent, setNoteContent] = useState<Delta | undefined>(content);
//   const [noteHTML, setNoteHTML] = useState<string>()
//   const readOnlyEditorRef = useRef<ReactQuill | null>(null);

//   const handleChange = (content: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => {
//     setNoteContent(editor.getContents());
//   };

//   const modules = useMemo(() => ({
//     toolbar: !openNoteEditor ?
//       false
//       :
//       [
//         ['bold', 'italic', 'underline'],
//         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//         ['clean']
//       ],
//     clipboard: {
//       // toggle to add extra line breaks when pasting HTML:
//       matchVisual: false,
//     }
//   }), [openNoteEditor]);

//   const handleSaveNote = async () => {
//     try {
//       const { data: updatedHostNote, error: updatedHostNoteError } = await supabaseClient
//         .from('Playdates')
//         .update({ host_notes: noteContent }) //update status column
//         .eq('id', playdateID)
//         .select()
//       if (updatedHostNoteError) {
//         throw updatedHostNoteError
//       }
//       setOpenNoteEditor(false)

//       setNoteContent(updatedHostNote[0].host_notes)
//       return updatedHostNote
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   return (


//     <>
//       <ReactQuill value={noteContent} readOnly={!openNoteEditor} onChange={handleChange} modules={modules} />
//       {openNoteEditor
//         ?
//         <button className='min-w-40 px-2 w-90 text-xs cursor-pointer py-1 my-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none' onClick={handleSaveNote}>Save Note</button>
//         :
//         null
//       }
//     </>

//   )
// }

// export default QuillEditor

// import { useEffect, useMemo, useRef, useState } from 'react';
// import ReactQuill, { UnprivilegedEditor } from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { Delta } from 'quill/core';
// import Sources from 'quill';
// import supabaseClient from '@/utils/supabase/client';

// interface QuillEditorProps {
//   content: Delta | undefined;
//   playdateID: string;
//   setOpenNoteEditor: (newState: boolean) => void;
//   openNoteEditor: boolean;
// }

// const QuillEditor: React.FC<QuillEditorProps> = ({ content, playdateID, setOpenNoteEditor, openNoteEditor }) => {
//   const [editorContent, setEditorContent] = useState<string>('');
//   const quillRef = useRef<ReactQuill>(null);

//   useEffect(() => {
//     if (content && quillRef.current) {
//       const editor = quillRef.current.getEditor();
//       editor.setContents(content);
//       setEditorContent(editor.root.innerHTML);
//     }
//   }, [content]);

//   const handleChange = (content: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => {
//     setEditorContent(content);
//   };

//   const modules = useMemo(() => ({
//     toolbar: !openNoteEditor
//       ? false
//       : [
//           ['bold', 'italic', 'underline'],
//           [{ list: 'ordered' }, { list: 'bullet' }],
//           ['clean'],
//         ],
//     clipboard: {
//       matchVisual: false,
//     },
//   }), [openNoteEditor]);

//   const handleSaveNote = async () => {
//     try {
//       const deltaContent = quillRef.current?.getEditor().getContents();
//       const { data: updatedHostNote, error: updatedHostNoteError } = await supabaseClient
//         .from('Playdates')
//         .update({ host_notes: deltaContent })
//         .eq('id', playdateID)
//         .select();
//       if (updatedHostNoteError) {
//         throw updatedHostNoteError;
//       }
//       setOpenNoteEditor(false);
//       if (updatedHostNote && updatedHostNote[0].host_notes) {
//         setEditorContent(updatedHostNote[0].host_notes);
//       }
//       return updatedHostNote;
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <>
//       <ReactQuill
//         ref={quillRef}
//         value={editorContent}
//         readOnly={!openNoteEditor}
//         onChange={handleChange}
//         modules={modules}
//       />
//       {openNoteEditor && (
//         <button
//           className="min-w-40 px-2 w-90 text-xs cursor-pointer py-1 my-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none"
//           onClick={handleSaveNote}
//         >
//           Save Note
//         </button>
//       )}
//     </>
//   );
// };

// export default QuillEditor;

import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Delta } from 'quill/core';
import supabaseClient from '@/utils/supabase/client';

interface QuillEditorProps {
  content: Delta | undefined;
  playdateID: string;
  setOpenNoteEditor: (newState: boolean) => void;
  openNoteEditor: boolean;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ content, playdateID, setOpenNoteEditor, openNoteEditor }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [quill, setQuill] = useState<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !quill) {
      const quillInstance = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarRef.current
        }
      });
      setQuill(quillInstance);
    }
  }, []);

  useEffect(() => {
    if (quill && content) {
      quill.setContents(content);
    }
  }, [quill, content]);

  useEffect(() => {
    if (quill) {
      quill.enable(openNoteEditor);
      if (toolbarRef.current) {
        toolbarRef.current.style.display = openNoteEditor ? '' : 'none';
      }
    }
  }, [openNoteEditor, quill]);

  const handleSaveNote = async () => {
    if (!quill) return;

    try {
      const deltaContent = quill.getContents();
      const { data: updatedHostNote, error: updatedHostNoteError } = await supabaseClient
        .from('Playdates')
        .update({ host_notes: deltaContent })
        .eq('id', playdateID)
        .select();
      if (updatedHostNoteError) {
        throw updatedHostNoteError;
      }
      setOpenNoteEditor(false);
      return updatedHostNote;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div ref={toolbarRef}>
        <span className="ql-formats">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered"></button>
          <button className="ql-list" value="bullet"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-clean"></button>
        </span>
      </div>
      <div ref={editorRef} style={{ height: '200px', border: '1px solid #ccc' }}></div>
      {openNoteEditor && (
        <button
          className="min-w-40 px-2 w-90 text-xs cursor-pointer py-1 my-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none"
          onClick={handleSaveNote}
        >
          Save Note
        </button>
      )}
    </div>
  );
};

export default QuillEditor;