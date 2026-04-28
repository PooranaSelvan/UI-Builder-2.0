import React, { useState } from 'react';
import "./promptmodal.css";
import { BotMessageSquare, WandSparkles, Copy } from 'lucide-react';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';

const PromptModal = ({ setShowAiModel, onSubmit, isGenerating, isGenerated, data, setData }) => {
     const [prompt, setPrompt] = useState("");

     const handleCopyData = async () => {
          if(!data){
               toast.error("Please wait for the AI to Complete Generation!");
               return;
          }

          try {
               await navigator.clipboard.writeText(JSON.stringify(data));
               toast.success("Data Copied Successfully!", {id : "generate"});
          } catch (error) {
               console.log(error);
               toast.error("Error Copying Link!", {id : "generate"});
          }
     }

     return (
          <div className='prompt-wrapper'>
               <div className="prompt-header">
                    <div className="prompt-icon">
                         <BotMessageSquare size={28} />
                    </div>
                    <h3>Create your own Component <br /> <span>with AI</span></h3>
               </div>
               <div className="prompt-body">
                    <textarea name="" id="" rows={7} cols={35} disabled={isGenerating} value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
                    {isGenerated && (
                         <div className='json-output-wrapper'>
                              <p>Your Component has been generated!</p>
                              <Copy size={20} onClick={handleCopyData} className='copy-icon' />
                         </div>
                    )}
                    <div className="prompt-btns">
                         <Button className='prompt-cancel-btn' onClick={() => {setShowAiModel(false); setData(null);}}>Cancel</Button>
                         {!isGenerating ? (
                              <Button className='prompt-generate-btn' onClick={() => onSubmit(prompt)}>
                                   <WandSparkles />
                                   Generate
                              </Button>
                         ) : (
                              <Button className='prompt-generate-btn' disabled>
                                   Generating
                                   <div className="file-loader"></div>
                              </Button>
                         )}
                    </div>
               </div>
          </div>
     )
}

export default PromptModal