import RenderComponents from '../../../components/RenderComponents.jsx';

const PreviewCanvas = () => {
     let components = JSON.parse(localStorage.getItem("previewComponents")) || [];

     if (components.length === 0) {
          return (
               <div>There is No Components to Preview!</div>
          );
     }

     return (
          <div className='preview-container' style={{ flex: 1 }}>
               {components.length && (
                    <RenderComponents>
                         {components}
                    </RenderComponents>
               )}
          </div>
     )
}

export default PreviewCanvas;