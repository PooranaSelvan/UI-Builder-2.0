import { VOID_TAGS } from "./voidTags.js";
  
  export const generateHTML = (componentTree = []) => {


    //Helpers  
    const toKebabCase = (text = "") =>
      text.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase());
  
    const convertStyleToString = (styleObject = {}) =>
      Object.entries(styleObject)
        .map(([property, value]) => `${toKebabCase(property)}:${value}`)
        .join(";");
  

    const cleanClassNames = (classNames = "") =>
      classNames
        .split(" ")
        .filter(name => name && name !== "test-component")
        .join(" ");
  
  
    //HTML Builder
    const buildHTMLFromComponents = (components) => {
      return components.map(component => {
  
        const {
          id,
          tag,
          content,
          defaultProps = {},
          children = []
        } = component;
  
        const {
          style = {},
          className = "",
          events = {},
          ...otherAttributes
        } = defaultProps;
  
     
        //Attributes  
        const idAttribute = id ? ` id="${id}"` : "";
  
        const classAttribute = className
          ? ` class="${cleanClassNames(className)}"`
          : "";
  
        const styleAttribute =
          style && Object.keys(style).length
            ? ` style="${convertStyleToString(style)}"`
            : "";
  
        const additionalAttributes = Object.entries(otherAttributes)
          .map(([key, value]) => ` ${key}="${value}"`)
          .join("");
  

        //Events  
        let eventAttributes = "";
  
        // Navigation
        if (events?.navigation?.type === "navigate") {
          eventAttributes +=
            ` onclick="window.open('${events.navigation.target}','_blank')"`;
        }
  
        // Visibility actions
        if (events?.visibility) {
          const { action, targetId } = events.visibility;
          const targetElement = targetId || id;
  
          if (action === "hide") {
            eventAttributes +=
              ` onclick="document.getElementById('${targetElement}').style.display='none'"`;
          }
  
          if (action === "show") {
            eventAttributes +=
              ` onclick="document.getElementById('${targetElement}').style.display='block'"`;
          }
  
          if (action === "toggle") {
            eventAttributes +=
              ` onclick="var el=document.getElementById('${targetElement}'); el.style.display = el.style.display==='none'?'block':'none'"`;
          }
        }
  
        // Input change events
        if (events?.onChange) {
          if (events.onChange.action === "alert") {
            eventAttributes += ` onchange="alert(this.value)"`;
          }
  
          if (events.onChange.action === "update") {
            eventAttributes +=
              ` onchange="document.getElementById('${events.onChange.targetId}').textContent=this.value"`;
          }
        }
  
    
        //build elements 
        if (VOID_TAGS.has(tag)) {
          return `<${tag}${idAttribute}${classAttribute}${styleAttribute}${additionalAttributes}${eventAttributes} />`;
        }
  
        const innerHTML =
          children.length > 0
            ? buildHTMLFromComponents(children).join("")
            : content || "";
  
        return `<${tag}${idAttribute}${classAttribute}${styleAttribute}${additionalAttributes}${eventAttributes}>${innerHTML}</${tag}>`;
      });
    };
  
  
    return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8" />
  <title>Exported Page</title>
  </head>
  <body>
  ${buildHTMLFromComponents(componentTree).join("")}
  </body>
  </html>
  `
  };

