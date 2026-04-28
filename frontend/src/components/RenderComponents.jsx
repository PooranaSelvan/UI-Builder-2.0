import React, { useState } from "react";
import { VOID_TAGS } from "../pages/workspace/utils/voidTags";
import { kebabCase } from "change-case";

const RenderComponents = ({ children }) => {
     const [hiddenIds, setHiddenIds] = useState({});
     const [dynamicText, setDynamicText] = useState({});
     const [hoveredIds, setHoveredIds] = useState({});

     const toggleVisibility = (id, action = "toggle") => {
          if (!id) return;

          setHiddenIds((prev) => {
               const updated = { ...prev };

               if (action === "show") {
                    delete updated[id];
               } else if (action === "hide") {
                    updated[id] = true;
               } else {
                    if (updated[id]) {
                         delete updated[id];
                    } else {
                         updated[id] = true;
                    }
               }

               return updated;
          });
     };

     const removeClass = (className = "") => {
          return className.split(" ").filter((c) => c && c !== "test-component").join(" ");
     };

     const handleAction = (event, eventName, id) => {
          if (!event?.action) return undefined;

          return (e) => {
               if (eventName === "onKeyDown" && event.key) {
                    let keyPressed = e.key === " " ? "Space" : e.key;
                    if (keyPressed !== event.key) return;
               }

               let value = e?.target?.value !== undefined ? e.target.value : "";

               const { action, message, targetId } = event;
               let target = targetId || id;

               switch (action) {
                    case "log":
                         console.log(message || value);
                         break;
                    case "alert":
                         alert(message || value);
                         break;
                    case "visibility":
                         toggleVisibility(target);
                         break;
                    case "update":
                         setDynamicText((prev) => ({
                              ...prev,
                              [target]: message || value,
                         }));
                         break;
                    default:
                         break;
               }
          };
     };

     const createHandlers = (events = {}, id) => {
          const res = {};

          if (events.navigation?.targetPage) {
               res.onClick = (e) => {
                    e.preventDefault();
                    const { targetPage, target = "_self" } = events.navigation;

                    if (target === "_blank") {
                         window.open(targetPage, "_blank", "noopener,noreferrer");
                    } else {
                         window.location.href = targetPage;
                    }
               };
          } else if (events.visibility?.trigger === "click") {
               res.onClick = () => {
                    toggleVisibility(events.visibility.targetId || id, events.visibility.action);
               };
          } else if (events.onClick) {
               res.onClick = handleAction(events.onClick, "onClick", id);
          }

          if (events.visibility?.trigger === "hover") {
               const { action, targetId } = events.visibility;
               const target = targetId || id;

               res.onMouseEnter = () => {
                    toggleVisibility(target, action);
               };

               res.onMouseLeave = () => {
                    let reverse = action === "show" ? "hide" : action === "hide" ? "show" : "toggle";
                    toggleVisibility(target, reverse);
               };
          } else if (events.style) {
               res.onMouseEnter = () => {
                    setHoveredIds((prev) => ({ ...prev, [id]: true }));
               };

               res.onMouseLeave = () => {
                    setHoveredIds((prev) => {
                         const updated = { ...prev };
                         delete updated[id];
                         return updated;
                    });
               };
          }

          if (events.onChange) {
               res.onChange = handleAction(events.onChange, "onChange", id);
          }

          if (events.onFocus) {
               res.onFocus = handleAction(events.onFocus, "onFocus", id);
          }

          if (events.onBlur) {
               res.onBlur = handleAction(events.onBlur, "onBlur", id);
          }

          if (events.onClick) {
               res.onClick = handleAction(events.onClick, "onClick", id);
          }

          if (events.onKeyDown) {
               res.onKeyDown = handleAction(events.onKeyDown, "onKeyDown", id);
          }

          return { res };
     };

     const renderElements = (elements) => {
          let ele = elements.map((element, index) => {
               const { id, tag, content, defaultProps = {}, children = [] } = element;
               const { events, style: rawStyle = {}, mediaquery, ...rest } = defaultProps;
               const { res } = createHandlers(events, id);
               let mediaQuery = mediaquery?.style || "";
               let elementStyle = {};

               if (hoveredIds[id] && events?.style) {
                    if (events.style.hoverColor) {
                         elementStyle.backgroundColor = events.style.hoverColor;
                    }
                    if (events.style.borderColor) {
                         elementStyle.borderColor = events.style.borderColor;
                    }
                    if (events.style.color) {
                         elementStyle.color = events.style.color;
                    }
               }

               if (hiddenIds[id]) {
                    elementStyle.display = "none";
               }

               let orginalClassName = removeClass(rest.className) || "";

               let convertedCase = Object.keys(rawStyle).reduce((acc, k) => {
                    acc[kebabCase(k)] = rawStyle[k];
                    return acc;
               }, {});

               let css = "";
               if (id && Object.keys(convertedCase).length > 0) {
                    css = `#${id} {\n${Object.entries(convertedCase).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;
               }

               if (mediaQuery) {
                    css += "\n" + mediaQuery;
               }

               const props = { ...rest, ...res, id, ...(Object.keys(elementStyle).length > 0 ? { style: elementStyle } : {}), className: orginalClassName };
               const textContent = id in dynamicText ? dynamicText[id] : content;

               if (VOID_TAGS.has(tag)) {
                    return (
                         <>
                              {css && <style>{css}</style>}
                              {React.createElement(tag, { ...props })}
                         </>
                    );
               }

               return (
                    <>
                         {css && <style>{css}</style>}
                         {React.createElement(tag, { ...props }, children.length > 0 ? renderElements(children) : textContent)}
                    </>
               );
          });

          return ele;
     };

     return <>{renderElements(children)}</>;
};

export default RenderComponents;