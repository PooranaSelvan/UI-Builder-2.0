// import {
//      Grid,
//      Layout,
//      Square,
//      Heading,
//      AlignLeft,
//      MousePointerClick,
//      FormInput,
//      Image,
//      CircleUserRound,
//      Minus,
//      Star
// } from "lucide-react";

export const BasicComponents = [
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
                         className: "layout-container test-component",
                         style: { minHeight: "150px" }
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
                    defaultProps: {
                         className: "basic-heading test-component"
                    }
               },
               {
                    id: "paragraph",
                    label: "Paragraph",
                    icon: "AlignLeft",
                    tag: "p",
                    rank: 4,
                    content:
                         "Paragraph text goes here. This is a sample paragraph that can be edited later.",
                    defaultProps: {
                         className: "basic-paragraph test-component"
                    }
               },
               {
                    id: "button",
                    label: "Button",
                    icon: "MousePointerClick",
                    tag: "button",
                    rank: 4,
                    content: "Button",
                    defaultProps: {
                         className: "basic-button test-component",
                         type: "button"
                    }
               },
               {
                    id: "input",
                    label: "Input",
                    icon: "FormInput",
                    tag: "input",
                    rank: 4,
                    defaultProps: {
                         className: "basic-input test-component",
                         type: "text",
                         placeholder: "Enter text"
                    }
               },
               {
                    id: "image",
                    label: "Image",
                    icon: "Image",
                    tag: "img",
                    rank: 4,
                    defaultProps: {
                         className: "basic-image test-component",
                         src: "https://placehold.co/150x150",
                         alt: "placeholder"
                    }
               },
               {
                    id: "avatar",
                    label: "Avatar",
                    icon: "CircleUserRound",
                    tag: "img",
                    rank: 4,
                    componentType: "avatar",
                    defaultProps: {
                         className: "basic-image test-component",
                         src: "",
                         alt: "User avatar"
                    }
               },
               {
                    id: "textarea",
                    label: "Textarea",
                    icon: "AlignLeft",
                    tag: "textarea",
                    rank: 4,
                    defaultProps: {
                         className: "basic-textarea test-component",
                         rows: 5,
                         placeholder: "Enter text here"
                    }
               },
               {
                    id: "radio",
                    label: "Radio",
                    icon: "FormInput",
                    tag: "input",
                    rank: 4,
                    defaultProps: {
                         type: "radio",
                         className: "basic-radio test-component"
                    }
               },
               {
                    id: "checkbox",
                    label: "Checkbox",
                    icon: "FormInput",
                    tag: "input",
                    rank: 4,
                    defaultProps: {
                         type: "checkbox",
                         className: "basic-checkbox test-component"
                    }
               },
               {
                    id: "divider",
                    label: "Divider",
                    icon: "Minus",
                    tag: "hr",
                    rank: 4,
                    defaultProps: {
                         className: "basic-divider test-component"
                    }
               }
          ]
     }
];
