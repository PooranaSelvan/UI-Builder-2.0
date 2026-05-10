import React from 'react';
import "./docs.css";
import { ZoomIn, ZoomOut, Minimize2, Maximize2, Undo2, Redo2 } from 'lucide-react';

const Dock = ({ zoom, onZoomOut, onZoomIn, onReset, onUndo, onRedo, canUndo, canRedo }) => {
     let zoomPercentage = Math.round(zoom * 100);
     let canZoomIn = zoom < 2;
     let canZoomOut = zoom > 0.25;


     return (
          <div className='dock-wrapper' id='dock-tour'>
               <Undo2
                    onClick={canUndo ? onUndo : undefined}
                    className={!canUndo ? 'dock-icon-disabled' : ''}
                    title="Undo (Ctrl+Z)"
               />
               <Redo2
                    onClick={canRedo ? onRedo : undefined}
                    className={!canRedo ? 'dock-icon-disabled' : ''}
                    title="Redo (Ctrl+Shift+Z)"
               />
               <div className="divider-line" />
               <ZoomOut onClick={onZoomOut} disabled={!canZoomOut} />
               <input type="text" value={`${zoomPercentage}%`} readOnly />
               <ZoomIn onClick={onZoomIn} disabled={!canZoomIn} />
               {zoom !== 1 && (zoom < 1 ? (
                    <>
                         <div className="divider-line" />
                         <Maximize2 onClick={onReset} />
                    </>
               ) : (
                    <>
                         <div className="divider-line" />
                         <Minimize2 onClick={onReset} />
                    </>
               ))}
          </div>
     )
}

export default Dock