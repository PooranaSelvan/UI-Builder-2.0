// import {
//      Image,
//      Square,
//      Link2,
//      Video,
//      Minus,
//      Layout,
//      MousePointerClick,
//      FormInput,
//      List,
//      Grid,
//      Heading,
//      AlignLeft
// } from "lucide-react";

export const components = [
     {
          title: "Layout",
          type: "grid",
          items: [
               {
                    id: "container",
                    label: "Container",
                    icon: "Square",
                    tag: "div",
                    rank: 1,
                    content: "Container",
                    defaultProps: {
                         className: "layout-container test-component", style: {
                              height: "500px"
                         }
                    },
                    children: []
               },
               {
                    id: "row",
                    label: "Row",
                    icon: "Grid",
                    tag: "div",
                    rank: 2,
                    content: "Row",
                    defaultProps: {
                         className: "layout-row test-component",
                         style: {
                              height: "300px"
                         }
                    },
                    children: []
               },
               {
                    id: "column",
                    label: "Column",
                    icon: "Layout",
                    tag: "div",
                    rank: 3,
                    content: "Column",
                    defaultProps: {
                         className: "layout-column test-component", style: {
                              height: "300px"
                         }
                    },
                    children: []
               }
          ]
     },
     {
          title: "Basic Elements",
          type: "grid",
          items: [
               {
                    id: "heading",
                    label: "Heading",
                    icon: "Heading",
                    tag: "h2",
                    rank: 4,
                    content: "Heading Text",
                    defaultProps: { className: "basic-heading test-component" }
               },
               {
                    id: "paragraph",
                    label: "Paragraph",
                    icon: "AlignLeft",
                    tag: "p",
                    rank: 4,
                    content: "Paragraph text goes here. This is a sample paragraph that can be edited later.",
                    defaultProps: { className: "basicparagraph test-component" }
               },
               {
                    id: "image",
                    label: "Image",
                    icon: "Image",
                    tag: "img",
                    rank: 4,
                    defaultProps: {
                         className: "basic-image test-component",
                         src: "https://placehold.co/200x200",
                         alt: "Placeholder image"
                    }
               },
               {
                    id: "button",
                    label: "Button",
                    icon: "MousePointerClick",
                    tag: "button",
                    rank: 4,
                    content: "Click me",
                    defaultProps: {
                         className: "basic-button test-component",
                         type: "button",
                    }
               },
               {
                    id: "link",
                    label: "Link",
                    icon: "Link2",
                    tag: "a",
                    rank: 4,
                    content: "Link",
                    defaultProps: {
                         className: "basic-link test-component",
                         href: "#"
                    }
               },
               {
                    id: "divider",
                    label: "Divider",
                    icon: "Minus",
                    tag: "hr",
                    rank: 4,
                    defaultProps: { className: "basic-divider test-component" }
               },
               {
                    id: "video",
                    label: "Video",
                    icon: "Video",
                    tag: "div",
                    rank: 4,
                    content: "Video placeholder",
                    defaultProps: { className: "basic-video test-component" }
               }
          ]
     },
     {
          title: "Forms",
          type: "grid",
          items: [
               {
                    id: "input",
                    label: "Input",
                    icon: "FormInput",
                    tag: "input",
                    rank: 4,
                    defaultProps: {
                         className: "form-input test-component",
                         type: "text",
                         placeholder: "Enter your text here",
                    }
               },
               {
                    id: "textarea",
                    label: "Textarea",
                    icon: "AlignLeft",
                    tag: "textarea",
                    rank: 4,
                    defaultProps: {
                         className: "form-textarea test-component",
                         placeholder: "Enter your para here",
                         rows: 3
                    }
               },
               {
                    id: "select",
                    label: "Select",
                    icon: "List",
                    tag: "select",
                    rank: 4,
                    defaultProps: {
                         className: "form-select test-component"
                    },
                    children: [
                         { tag: "option", content: "Option 1", defaultProps: { value: "1" } },
                         { tag: "option", content: "Option 2", defaultProps: { value: "2" } },
                         { tag: "option", content: "Option 3", defaultProps: { value: "3" } },
                    ]
               }
          ]
     }
];