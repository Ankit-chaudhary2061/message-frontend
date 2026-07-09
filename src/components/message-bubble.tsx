import { useRef, useState } from "react";
import {
  IMessage,
  IUser,
} from "../lib/store/chat/chat-slice-types";
import { format } from "date-fns";
import { FaCheck, FaCheckDouble,FaPlus,FaRegCopy,FaSmile, FaTrash } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { addReaction } from "../lib/socket/socket-events";
import useOutsideClick from "../lib/utiil/use-out-side-click";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {RxCross2} from 'react-icons/rx'
import { useAppDispatch } from "../lib/store/hook";
import { addReactionThunk, deleteMessage, deleteMessageThunk } from "../lib/store/chat/chat-slice";
 interface MessageBubbleProps {
  message: IMessage;
  theme?: "light" | "dark" | string;
  currentUser: IUser;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageBubble = ({
  message,
  theme,
  currentUser,
  onReact,
  onDelete,
}: MessageBubbleProps) => {
  // ==========================
  // Early Return
  // ==========================
  if (!message) return null;

  // ==========================
  // Derived Values
  // ==========================
  const dispatch = useAppDispatch()
  const isOwnMessage = message.sender._id === currentUser._id;

  const bubbleClass = isOwnMessage ? "chat-end" : "chat-start";

  const bubbleContentClass = `chat-bubble md:max-w-[50%] min-w-[130px] ${
    isOwnMessage
      ? theme === "dark"
        ? "bg-[#144d38] text-white"
        : "bg-[#d9fdd3] text-black"
      : theme === "dark"
      ? "bg-gray-700 text-white"
      : "bg-white text-black"
  }`;

  // ==========================
  // State
  // ==========================
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // ==========================
  // Refs
  // ==========================
  const messageRef = useRef<HTMLDivElement>(null);
  const optionRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);

  // ==========================
  // Handlers
  // ==========================
const handleReact = (emoji: string) => {
  addReaction(
    message._id,
    currentUser._id,
    message.sender._id,
    emoji
  );

  setShowEmojiPicker(false);
  setShowReactions(false);
};


useOutsideClick(emojiPickerRef,()=>{
  if(showEmojiPicker)setShowEmojiPicker(false)
})

useOutsideClick(reactionMenuRef, () => {
  if (showReactions) {
    setShowReactions(false);
  }
});

useOutsideClick(optionRef,()=>{
  if(showOptions) setShowOptions(false)
})
  // ==========================
  // Render
  // ==========================
  return (
   <div className={`chat ${bubbleClass}`}>
  <div
    ref={messageRef}
    className={`${bubbleContentClass} relative group`}
  >
    {/* Message Content */}
    <div className="flex flex-col gap-2">
      {/* Text */}
      {message.contentType === "text" && (
        <p className="break-words whitespace-pre-wrap">
  {message.content}
</p>
      )}

      {/* Image */}
      {message.contentType === "image" &&
        message.imageOrVideoUrl && (
          <img
            src={message.imageOrVideoUrl}
            alt="Image"
            className="max-w-xs rounded-lg object-cover"
          />
        )}

      {/* Video */}
      {message.contentType === "video" &&
        message.imageOrVideoUrl && (
          <video
            controls
            className="max-w-xs rounded-lg"
          >
            <source
              src={message.imageOrVideoUrl}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        )}
    </div>

    {/* Time & Status */}
    <div className="flex justify-end items-center gap-1 mt-2 text-[11px] opacity-70">
      <span>{format(new Date(message.createdAt), "HH:mm")}</span>

      {isOwnMessage && (
        <>
          {message.messageStatus === "sent" && (
            <FaCheck size={12} />
          )}

          {message.messageStatus === "delivered" && (
            <FaCheckDouble size={12} />
          )}

          {message.messageStatus === "read" && (
            <FaCheckDouble
              size={12}
              className="text-blue-500"
            />
          )}
        </>
      )}
    </div>
<div  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
  <button onClick={()=> setShowOptions((prev) => !prev)}
    className={`p-1 rounded-full ${theme === 'dark' ? "text-white" : "text-gray-800"}`}
    >
    <HiDotsVertical size={18}/>

  </button>

</div>
<div className={`absolute ${isOwnMessage ? "-left-10" : "-right-10" } top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col-gap-2`}>
<button
onClick={()=>setShowReactions(!showReactions)}
className={`p-2 rounded-full ${theme === 'dark' ? "bg-[#202c33] hover:bg-[#202c33]/80 " : "bg-white hover:bg-gray-100"}`}
>

  <FaSmile className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} shadow-lg`} />
</button>
</div>

{
  showReactions && (
    <div 
    ref={reactionMenuRef}
    className={`absolute -top-8 ${isOwnMessage ? "left-0" : "left-36"} transform -transalte-x-1/2 flex items-center bg-[#202c33]/90 rounded-full px-2 py-1.5 gap-1 shadow-lg z-50`}
    >
      {
        QUICK_REACTIONS.map((emoji,index) =>(
          <button 
          key={index}
          onClick={()=> handleReact(emoji)}
          className="hover:scale-125 transition-transform p-1"
          >


            {emoji}
          </button>
        ))
      }
     <div className="w-[1px] h-5 bg-gray-600 mx-1" />

<button
  className="hover:bg-[#ffffff1a] rounded-full p-1"
  onClick={() => setShowEmojiPicker(true)}
>
  <FaPlus className="h-4 w-4 text-gray-300" />
</button>


    </div>
  )
}
{showEmojiPicker && (
  <div
        ref={emojiPickerRef}
        className="absolute left-0 mb-6 z-50"
      > 

      <div className="realtive
      ">
    <EmojiPicker
    theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
    onEmojiClick={(emojiData) => {
    handleReact(emojiData.emoji)
      setShowEmojiPicker(false);
    }}
  />
  <button
  onClick={() => setShowEmojiPicker(false)}
  className="absolute top-2 right-2 text-gary-500 hover:text-gray-700"
  >

    <RxCross2/>
  </button>

      </div>
    
      </div>
)
}
{message.reactions && message.reactions.length > 0 && (
  <div className={`absolute -bottom-5 ${isOwnMessage ? "right-2" : "left-2" } ${theme === 'dark' ? " bg-[#2a3942] " : "bg-gray-200"} rounded-full px-2 shadow-md`}>
{
  message.reactions.map((reaction, index)=>(
    <span key={index} className="mr-1">
      {reaction.emoji}
    </span>
  ))
}
  </div>
)}

{
  showOptions && (
    <div ref={optionRef}
    className={`absolute top-8 right-1 z-50 w-36 rounded-xl shadow-lg py-2 text-sm ${theme === 'dark' ? "bg-[#1d1f1f] text-white" : "bg-gray-100 text-black" }`}
    >
<button 
onClick={()=>{
if(message.contentType === 'text'){
  navigator.clipboard.writeText(message.content)
}
setShowOptions(false)
}}
className="flex items-center w-full px-4 py-2 gap-3 rounded-lg"
>
  <FaRegCopy size={14}/>
  <span>Copy</span>

</button>
{isOwnMessage && (
  <button
    onClick={() => {
      dispatch(deleteMessageThunk(message._id));
      setShowOptions(false);
    }}
    className="flex items-center w-full px-4 py-2 gap-3 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-500/10"
  >
    <FaTrash size={14}
    className="text-red-600"
    />
    <span>Delete</span>
  </button>
)}
    </div>
  )
}

  </div>
</div>
  );
};

export default MessageBubble;