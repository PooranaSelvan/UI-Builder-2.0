import React, { useEffect, useRef, useState } from 'react'
import "./RightSideBar.css";
import "../../../index.css"
import { ListPlus, MonitorSmartphone, Settings } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { ChevronDown } from 'lucide-react';
import { ChevronUp } from 'lucide-react';
import { Zap } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import { Columns3 } from 'lucide-react';
import { Space } from 'lucide-react';
import { MountainSnow } from 'lucide-react';
import { Grid2x2 } from 'lucide-react';
import { Type } from 'lucide-react';
import { TableRowsSplit } from 'lucide-react';
import { FileUp } from 'lucide-react';
import { Webhook } from 'lucide-react';
import { Cloud, Trash2 } from 'lucide-react';
import { MoveLeft, MoveRight, MoveDown, MoveUp } from 'lucide-react';
import { Workflow } from 'lucide-react';
import ImportedFiles from './components/ImportedFiles';
import ImageUpload from './components/ImageUpload';
import WebFont from 'webfontloader';
import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorView } from '@uiw/react-codemirror';
import { EditorState } from '@uiw/react-codemirror';
import tinycolor from 'tinycolor2'
import toast from 'react-hot-toast';

/*Used in the rendering of the select tag in the units for height, width */
const UNITS = ["px", "%", "rem", "em", "auto"];

/*used to render the required events according to the component is selected */
const EVENT_MAP = {
    div: ["visibility", "style"],
    h2: ["visibility", "style"],
    p: ["visibility", "style"],
    img: ["visibility", "style"],
    button: ["navigation", "visibility", "style", "onfocus", "onblur", "onclick", "onkeydown"],
    a: ["navigation", "onfocus", "onblur", "onclick"],
    input: ["visibility", "style", "onchange", "onfocus", "onblur"],
    textarea: ["visibility", "style"],
    select: ["visibility", "style"],
};

const COMPONENT_PROPS_MAP = {
    input: [
        { key: "type", label: "Input Type", type: "select", options: [{ label: "Text", value: "text" }, { label: "Email", value: "email" }, { label: "Password", value: "password" }, { label: "Number", value: "number" }, { label: "Telephone", value: "tel" }, { label: "URL", value: "url" }, { label: "Date", value: "date" }, { label: "Checkbox", value: "checkbox" }, { label: "Radio Button", value: "radio" }] },
        { key: "placeholder", label: "Placeholder", type: "text" },
        { key: "minLength", label: "Min Length", type: "number" },
        { key: "maxLength", label: "Max Length", type: "number" },
        { key: "min", label: "Min Value", type: "number" },
        { key: "max", label: "Max Value", type: "number" },
        { key: "required", label: "Required", type: "checkbox" },
        { key: "disabled", label: "Disabled", type: "checkbox" },
        { key: "readOnly", label: "Read Only", type: "checkbox" },
    ],
    button: [
        { key: "type", label: "Button Type", type: "select", options: [{ label: "Button", value: "button" }, { label: "Submit", value: "submit" }, { label: "Reset", value: "reset" }] },
        { key: "disabled", label: "Disabled", type: "checkbox" },
    ],
    img: [
        { key: "alt", label: "Alt Text", type: "text" },
    ],
    a: [
        { key: "href", label: "URL", type: "text" },
        { key: "target", label: "Target", type: "select", options: [{ label: "Current page", value: "_self" }, { label: "New page", value: "_blank" },] },
    ],
    select: [
        { key: "multiple", label: "Multiple Select", type: "checkbox" },
        { key: "disabled", label: "Disabled", type: "checkbox" },
        { key: "required", label: "Required", type: "checkbox" },
    ],
    textarea: [
        { key: "placeholder", label: "Placeholder", type: "text" },
        { key: "rows", label: "Rows", type: "number" },
        { key: "cols", label: "Cols", type: "number" },
        { key: "minLength", label: "Min Length", type: "number" },
        { key: "maxLength", label: "Max Length", type: "number" },
        { key: "disabled", label: "Disabled", type: "checkbox" },
        { key: "readOnly", label: "Read Only", type: "checkbox" },
        { key: "required", label: "Required", type: "checkbox" },
        { key: "resize", label: "Resize", type: "select", options: [{ label: "Both", value: "both" }, { label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }, { label: "None", value: "none" }] },
    ],
};

const DEFAULT_KEYS = ["Enter", "Escape", "Tab", "Backspace", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Delete"];

const FILE_IMPORT_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

const RightSideBar = ({ selectedComponent, updateComponent, deleteComponent }) => {
    const [activeTab, setActiveTab] = useState("properties");
    const [files, setFiles] = useState([]);
    const [apis, setApis] = useState([]);
    const [apiUrl, setApiUrl] = useState("");
    const [loadingApi, setLoadingApi] = useState(false);
    const [eventType, setEventType] = useState("");
    const [classInput, setClassInput] = useState("");
    const baseClasses = (selectedComponent?.baseClassName || "").split(" ");
    const allClasses = (selectedComponent?.defaultProps?.className || "").split(" ");
    const userClass = allClasses
        .filter(cls => !baseClasses.includes(cls))
        .join(" ");
    const display = selectedComponent?.defaultProps?.style?.display ?? "block";
    const allowedEvents = EVENT_MAP[selectedComponent?.tag] || [];
    const selectedAction = selectedComponent?.defaultProps?.events?.[eventType]?.action ?? "";
    const inputType = selectedComponent?.defaultProps?.type ?? "";

    /*To fetch the data from the api that entered by the user */
    const fetchApiData = async () => {
        if (!apiUrl) {
            return;
        }
        try {
            setLoadingApi(true);

            const res = await fetch(apiUrl);

            if (!res.ok) {
                throw new Error("API request failed");
            }

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Invalid JSON response");
            }
            const formattedText = JSON.stringify(data, null, 2);

            const newApi = {
                id: uuidv4(),
                url: apiUrl,
                status: "connected",
                content: formattedText
            }

            updateComponent(selectedComponent.id, (node) => {
                node.content = formattedText;
                node.defaultProps ??= {};
                node.apiId = newApi.id;
            })

            setApis(api => [...api, newApi])
        } catch (err) {
            alert("Api fetch failed");
        } finally {
            setLoadingApi(false)
        }
    }

    const deleteApi = (apiId) => {
        setApis(e => e.filter(api => api.id !== apiId));

        updateComponent(selectedComponent.id, (node) => {
            if (node.apiId === apiId) {
                node.content = "enter data";
                delete node.apiId;
            }
        })
    }

    const filteredApi = apis.filter(a => a.id === selectedComponent?.apiId);

    useEffect(() => {
        if (!selectedComponent) return;

        updateComponent(selectedComponent.id, (node) => {
            node.defaultProps ??= {};
            node.defaultProps.style ??= {};

            const style = node.defaultProps.style;

            style.paddingTop ??= "0px";
            style.paddingRight ??= "0px";
            style.paddingBottom ??= "0px";
            style.paddingLeft ??= "0px";
            style.marginTop ??= "0px";
            style.marginRight ??= "0px";
            style.marginBottom ??= "0px";
            style.marginLeft ??= "0px";
            style.borderBottomLeftRadius ??= "0px";
            style.borderBottomRightRadius ??= "0px";
            style.borderTopLeftRadius ??= "0px";
            style.borderTopRightRadius ??= "0px";

        });

    }, [selectedComponent?.id]);

    const readonlyClickHandler = EditorView.domEventHandlers({
        focus: () => {
            if (!userClass) {
                toast.error("Enter ClassName first!", { id: "all-need" });
            }
        },
        mousedown: () => {
            if (!userClass) {
                toast.error("Enter ClassName first!", { id: "all-need" });
            }
        }
    });

    useEffect(() => {
        const events = selectedComponent?.defaultProps?.events;

        if (!events) {
            setEventType("");
            return;
        }

        const firstEvent = Object.keys(events)[0];
        setEventType(firstEvent || "");
    }, [selectedComponent?.id, selectedComponent?.defaultProps?.events]);

    const handleFiles = async (fileList) => {
        if (!fileList || fileList.length === 0) return;

        const file = fileList[0];

        if (!file.text) {
            toast.error("Unsupported file type");
            return;
        }

        const text = await file.text();

        const rows = text.split("\n").map(line => line.split(",").map(cell => cell.trim()));

        const formattedText = rows.map(row => row.join(" - ")).join("\n");

        const newFile = {
            id: uuidv4(),
            name: file.name,
            /*Convert the input that come as bytes to kb */
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.name.split(".").pop(),
            status: "done",
            actions: true
        };

        updateComponent(selectedComponent.id, (node) => {
            node.content = formattedText;
            node.defaultProps ??= {};
            node.defaultProps.fileId ??= newFile.id;
        });

        setFiles(prev => [...prev, newFile]);
    };

    const deleteFile = (fileId) => {
        setFiles(e => e.filter(file => file.id !== fileId));

        updateComponent(selectedComponent.id, (node) => {
            if (node.defaultProps?.fileId === fileId) {
                node.content = "enter data";
                delete node.defaultProps.fileId
            }
        })
    }

    const getResponsive = () => {
        return `/*Tablet view*/
@media (min-width: 768px){

}


/*Mobile view*/
@media (min-width: 425px){

}
        `;
    }

    useEffect(() => {
        const existing = selectedComponent?.defaultProps?.mediaquery?.style;
        if (existing) {
            return;
        }

        const baseClass = selectedComponent?.baseClassName ?? "";
        const userClassName = selectedComponent?.defaultProps?.className ?? "";

        const className = userClassName.split(" ").filter(c => c !== baseClass).join(" ");

        if (!existing && className) {
            updateComponent(selectedComponent.id, (node) => {
                node.defaultProps ??= {};
                node.defaultProps.mediaquery ??= {};
                node.defaultProps.mediaquery.style =
                    getResponsive();
            });

        }
    }, [selectedComponent?.id])

    useEffect(() => {
        if (!selectedComponent) return;

        const systemClasses = ["test-component"];

        const allClasses =
            selectedComponent.defaultProps?.className?.split(" ") || [];

        const userClass = allClasses
            .filter(cls => !systemClasses.includes(cls))
            .join(" ");

        setClassInput(userClass);
    }, [selectedComponent?.id]);


    const filteredFiles = files.filter(f => f.id === selectedComponent?.defaultProps?.fileId);

    /*Render the right panel only if a component is selected */
    if (!selectedComponent) {
        return (
            <aside className="right-side-main-bar empty" id='right-sidebar-tour'>
                <p className='error-text'>Tap a component to bring it to life</p>
            </aside>
        );
    }

    return (
        <aside className='right-panel' onMouseOver={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <div className="right-side-main-bar" id='right-sidebar-tour'>
                <div className="button-flex">
                    {["properties", "style", "resources"].map((tab) => (
                        <button
                            key={tab}
                            className={activeTab === tab ? "active" : ""}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="right-side-content">
                    {activeTab === 'properties' && (
                        <>
                            <div className="properties-content">
                                <Heading icon={<Settings size={18}></Settings>} title={'General'}>
                                    <div className="properties-general">
                                        <div>
                                            <label htmlFor="">Element Id</label>
                                            <input type="text" placeholder='element_id' value={selectedComponent.id} onChange={(e) => {
                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.id = e.target.value;
                                                });
                                            }} disabled />

                                            <label>ClassName</label>
                                            <input
                                                type="text"
                                                placeholder="Enter the class name"
                                                value={classInput}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setClassInput(value);

                                                    updateComponent(selectedComponent.id, (node) => {
                                                        node.defaultProps ??= {};

                                                        const base = node.baseClassName || "";

                                                        node.defaultProps.className =
                                                            `${base} ${value}`.trim();
                                                    });
                                                }}
                                            />
                                        </div>
                                        {selectedComponent.tag === "input" && (
                                            <div className='content'>
                                                <label>Value</label>
                                                <input
                                                    type="text"
                                                    value={selectedComponent.defaultProps?.value || ""}
                                                    onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.value = e.target.value;
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {!["img", "video", "input"].includes(selectedComponent.tag) && (
                                            <div className='content'>
                                                <label>Content</label>
                                                <input
                                                    type="text"
                                                    value={selectedComponent.content || " "}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value.length === 0) {
                                                            return;
                                                        }
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.content = e.target.value;
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {["img", "video"].includes(selectedComponent.tag) && (
                                            <div className="content">
                                                <ImageUpload selectedComponent={selectedComponent} updateComponent={updateComponent} label={'Source'} />
                                            </div>

                                        )}

                                    </div>
                                </Heading>

                                <DynamicProps
                                    selectedComponent={selectedComponent}
                                    updateComponent={updateComponent}
                                />

                                {selectedComponent?.tag === "select" && (
                                    <SelectOption
                                        selectedComponent={selectedComponent}
                                        updateComponent={updateComponent}
                                    />
                                )}

                                {allowedEvents.length > 0 && (
                                    <Heading icon={<Zap size={18}></Zap>} title={'Events'} >
                                        <div className="properties-general properties-event">
                                            <div>
                                                <select
                                                    value={eventType} onChange={(e) => {
                                                        const newEvent = e.target.value;
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            if (!newEvent) {
                                                                delete node.defaultProps.events;
                                                                return;
                                                            }
                                                            node.defaultProps.events = {
                                                                [newEvent]: {}
                                                            };
                                                        });
                                                        setEventType(newEvent)
                                                    }}>
                                                    <option value="">Select Event</option>

                                                    {allowedEvents.includes("navigation") && (
                                                        <option value="navigation">Navigation Actions</option>
                                                    )}

                                                    {allowedEvents.includes("visibility") && (
                                                        <option value="visibility">Visibility Actions</option>
                                                    )}

                                                    {allowedEvents.includes("style") && (
                                                        <option value="style">Style & Layout Actions</option>
                                                    )}

                                                    {allowedEvents.includes("onchange") && (
                                                        <option value="onChange">Onchange Events</option>
                                                    )}
                                                    {allowedEvents.includes("onblur") && (
                                                        <option value="onBlur">Onblur Events</option>
                                                    )}
                                                    {allowedEvents.includes("onfocus") && (
                                                        <option value="onFocus">onFocus Events</option>
                                                    )}
                                                    {(allowedEvents.includes("onclick") || (selectedComponent.tag === "input" && ["checkbox", "radio"].includes(inputType))) && (
                                                        <option value="onClick">OnClick Events</option>
                                                    )}
                                                    {allowedEvents.includes("onkeydown") && (
                                                        <option value="onKeyDown">Key Down Events</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    </Heading>
                                )}

                                {eventType !== "" && (
                                    <Heading icon={<Workflow size={18} />} title="Behavior">
                                        {eventType === "navigation" && (
                                            <div className="event-form">
                                                <label>Target URL / Page</label>
                                                <input
                                                    value={selectedComponent?.defaultProps?.events?.navigation?.targetPage ?? ""}
                                                    type="text"
                                                    placeholder="Enter URL"
                                                    onChange={(e) =>
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.navigation = {
                                                                type: "navigate",
                                                                targetPage: e.target.value,
                                                            };
                                                        })
                                                    }
                                                />
                                                <label>Target</label>
                                                <select
                                                    value={selectedComponent?.defaultProps?.events?.navigation?.target ?? ""}
                                                    onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.navigation ??= {};
                                                            node.defaultProps.events.navigation.target = e.target.value;
                                                        })
                                                    }}
                                                >
                                                    <option value="">Select navigation type</option>
                                                    <option value="_self">Current page</option>
                                                    <option value="_blank">New page</option>
                                                </select>
                                            </div>
                                        )}

                                        {eventType === "visibility" && (
                                            <div className="event-form">
                                                <label>Trigger</label>

                                                <select
                                                    value={selectedComponent?.defaultProps?.events?.visibility?.trigger ?? ""}
                                                    onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.visibility ??= {};
                                                            node.defaultProps.events.visibility.trigger = e.target.value;
                                                        })
                                                    }}
                                                >
                                                    <option value="click">Click</option>
                                                    <option value="hover">Hover</option>
                                                </select>

                                                <label>Action</label>

                                                <select
                                                    value={selectedComponent?.defaultProps?.events?.visibility?.action ?? ""}
                                                    onChange={(e) =>
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.visibility ??= {};
                                                            node.defaultProps.events.visibility.action = e.target.value;
                                                        })
                                                    }
                                                >
                                                    <option value="show">Show</option>
                                                    <option value="hide">Hide</option>
                                                    <option value="toggle">Toggle</option>
                                                </select>

                                                <label>Target component</label>

                                                <input
                                                    value={selectedComponent?.defaultProps?.events?.visibility?.targetId ?? ""}
                                                    type="text"
                                                    placeholder='Enter the component Id'
                                                    onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.visibility ??= {};
                                                            node.defaultProps.events.visibility.targetId = e.target.value;
                                                        })
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {eventType === "style" && (
                                            <div className="event-form">
                                                <label>Hover Color</label>

                                                <ColorPalette
                                                    value={
                                                        selectedComponent?.defaultProps?.events?.style?.hoverColor ?? "#000000"
                                                    }
                                                    onChange={(color) =>
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.style ??= {};

                                                            node.defaultProps.events.style.hoverColor = color;
                                                        })
                                                    }
                                                />
                                                <label>Border Color</label>

                                                <ColorPalette
                                                    value={
                                                        selectedComponent?.defaultProps?.events?.style?.borderColor ?? "#000000"
                                                    }
                                                    onChange={(color) =>
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.style ??= {};

                                                            node.defaultProps.events.style.borderColor = color;
                                                        })
                                                    }
                                                />
                                                <label>Text Color</label>

                                                <ColorPalette
                                                    value={
                                                        selectedComponent?.defaultProps?.events?.style?.color ?? "#000000"
                                                    }
                                                    onChange={(color) =>
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events.style ??= {};
                                                            node.defaultProps.events.style.color = color;
                                                        })
                                                    }
                                                />
                                            </div>
                                        )}

                                        {["onChange", "onFocus", "onBlur", "onClick", "onKeyDown"].includes(eventType) && (
                                            <div className="event-form">
                                                {eventType === "onKeyDown" && (
                                                    <div>
                                                        <label>Key</label>
                                                        <select
                                                            value={
                                                                selectedComponent?.defaultProps?.events?.[eventType]?.key ?? ""
                                                            }
                                                            onChange={(e) => {
                                                                updateComponent(selectedComponent.id, (node) => {
                                                                    node.defaultProps ??= {};
                                                                    node.defaultProps.events ??= {};
                                                                    node.defaultProps.events[eventType] ??= {};
                                                                    node.defaultProps.events[eventType].key = e.target.value;
                                                                });
                                                            }}
                                                        >
                                                            <option value="">Select Key</option>
                                                            {DEFAULT_KEYS.map((key) => (
                                                                <option key={key} value={key}>
                                                                    {key}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <label>Change Event</label>
                                                <select
                                                    value={selectedAction}
                                                    onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.events ??= {};
                                                            node.defaultProps.events[eventType] ??= {};
                                                            node.defaultProps.events[eventType].action = e.target.value;
                                                        });
                                                    }}

                                                >
                                                    <option value="">None</option>
                                                    <option value="log">Console Log</option>
                                                    {eventType !== "onChange" && (
                                                        <option value="alert">Show Alert</option>
                                                    )}
                                                    <option value="visibility">Toggle Visibility</option>
                                                    <option value="update">Update </option>
                                                </select>
                                                {(selectedAction === "log" || selectedAction === "alert" || selectedAction === "update") && (
                                                    <div>
                                                        <label>Message</label>
                                                        <input
                                                            type="text"
                                                            placeholder='Enter the message'
                                                            value={selectedComponent.defaultProps?.events?.[eventType]?.message ?? ""}
                                                            onChange={(e) => {
                                                                updateComponent(selectedComponent.id, (node) => {
                                                                    node.defaultProps ??= {};
                                                                    node.defaultProps.events ??= {};
                                                                    node.defaultProps.events.onChange ??= {};
                                                                    node.defaultProps.events[eventType].message = e.target.value;
                                                                })
                                                            }}
                                                        />
                                                    </div>

                                                )}

                                                {(selectedAction === "visibility" || selectedAction === "update") && (
                                                    <div>
                                                        <label>Target Element</label>
                                                        <input
                                                            value={selectedComponent.defaultProps?.events?.[eventType]?.targetId ?? ""}
                                                            type="text"
                                                            placeholder='Enter the element Id'
                                                            onChange={(e) => {
                                                                updateComponent(selectedComponent.id, (node) => {
                                                                    node.defaultProps ??= {};
                                                                    node.defaultProps.events ??= {};
                                                                    node.defaultProps.events.onChange ??= {};
                                                                    node.defaultProps.events[eventType].targetId = e.target.value;
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    </Heading>
                                )}

                            </div>
                        </>
                    )}

                    {activeTab === 'style' && (
                        <div className="properties-content">
                            <Heading icon={<LayoutDashboard size={18} />} title={'Layout'} >
                                <div className="double-input">
                                    <div className="input-child">
                                        <label>Display</label>
                                        <select
                                            value={display}
                                            onChange={(e) => {
                                                let value = e.target.value
                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.defaultProps ??= {};
                                                    node.defaultProps.style ??= {};

                                                    let className = node.defaultProps.className;

                                                    if (value === 'none') {
                                                        if (!className.includes('hidden')) {
                                                            node.defaultProps.className = className + " hidden";
                                                        }
                                                        node.defaultProps.style.opacity = 0.2;
                                                        // node.defaultProps.style.display = value;
                                                    } else {
                                                        node.defaultProps.className = className.replace('hidden', "").trim();
                                                        node.defaultProps.style.opacity = 1;
                                                        node.defaultProps.style.display = value;
                                                    }
                                                })
                                            }}
                                        >
                                            <option value="block">◼ Block</option>
                                            <option value="flex">☰ Flex</option>
                                            <option value="grid">▦ Grid</option>
                                            <option value="none">✖ none</option>
                                        </select>
                                    </div>
                                    {display !== "flex" && (
                                        <div className='input-child'>
                                            <label htmlFor="">Position</label>
                                            <select value={selectedComponent?.defaultProps?.style?.position || "static"} onChange={(e) => {
                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.defaultProps ??= {};
                                                    node.defaultProps.style ??= {};
                                                    node.defaultProps.style.position = e.target.value;
                                                })
                                            }}>
                                                <option value="static">Static</option>
                                                <option value="relative">Relative</option>
                                                <option value="absolute">Absolute</option>
                                                <option value="fixed">Fixed</option>
                                                <option value="sticky">Sticky</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                {display !== 'flex' && (
                                    <FourSideInput
                                        label={'position value'}
                                        names={["Top", "Right", "Bottom", "Left"]}
                                        values={[
                                            parseInt(selectedComponent.defaultProps?.style?.top || 0),
                                            parseInt(selectedComponent.defaultProps?.style?.right) || 0,
                                            parseInt(selectedComponent.defaultProps?.style?.bottom) || 0,
                                            parseInt(selectedComponent.defaultProps?.style?.left) || 0,
                                        ]}
                                        onChange={(index, value) => {
                                            updateComponent(selectedComponent.id, (node) => {
                                                const map = [
                                                    "top",
                                                    "right",
                                                    "bottom",
                                                    "left",
                                                ];

                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};

                                                const actualValue = String(value).replace("px", "");

                                                node.defaultProps.style[map[index]] = `${actualValue}px`;
                                            })
                                        }}
                                    />
                                )}
                                <div className="double-input">
                                    <div className='input-child'>
                                        <SizeInput
                                            label="Width"
                                            value={selectedComponent.defaultProps?.style?.width}
                                            onChange={(v) =>
                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.defaultProps ??= {};
                                                    node.defaultProps.style ??= {};
                                                    node.defaultProps.style.width = v;
                                                })
                                            }
                                            maxPx={1200}
                                        />
                                    </div>
                                    <div className='input-child'>
                                        <SizeInput
                                            label="Height"
                                            value={selectedComponent.defaultProps?.style?.height}
                                            onChange={(v) =>
                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.defaultProps ??= {};
                                                    node.defaultProps.style ??= {};
                                                    node.defaultProps.style.height = v;
                                                })
                                            }
                                        />
                                    </div>
                                </div>


                            </Heading>
                            {display === 'flex' && (
                                <Heading icon={<Columns3 size={18} />} title={'Flex Layout'} >
                                    <div className="four-button">
                                        <div className="btn-box">
                                            {[
                                                { id: "row", icon: <MoveRight size={14} /> },
                                                { id: "row-reverse", icon: <MoveLeft size={14} /> },
                                                { id: "column", icon: <MoveDown size={14} /> },
                                                { id: "column-reverse", icon: <MoveUp size={14} /> }
                                            ].map(({ id, icon }) => (
                                                <button
                                                    key={id}
                                                    className={selectedComponent.defaultProps?.style?.flexDirection === id ? "active" : ""}
                                                    onClick={() => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.style ??= {};
                                                            node.defaultProps.style.flexDirection = id;
                                                        });
                                                    }}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="double-input">
                                        <div className='input-child'>
                                            <label htmlFor="">Justify Content</label>
                                            <select
                                                value={selectedComponent.defaultProps?.style?.justifyContent || ""}
                                                onChange={(e) => {
                                                    updateComponent(selectedComponent.id, (node) => {
                                                        node.defaultProps ??= {};
                                                        node.defaultProps.style ??= {};
                                                        node.defaultProps.style.justifyContent = e.target.value;
                                                    });
                                                }}
                                            >
                                                <option value="flex-start">flex-start</option>
                                                <option value="center">center</option>
                                                <option value="space-between">space-between</option>
                                                <option value="space-around">space-around</option>
                                                <option value="space-evenly">space-evenly</option>
                                                <option value="flex-end">flex-end</option>
                                            </select>
                                        </div>
                                        <div className='input-child'>
                                            <label htmlFor="">Align items</label>
                                            <select
                                                value={selectedComponent.defaultProps?.style?.alignItems || ""}
                                                onChange={(e) => {
                                                    updateComponent(selectedComponent.id, (node) => {
                                                        node.defaultProps ??= {};
                                                        node.defaultProps.style ??= {};
                                                        node.defaultProps.style.alignItems = e.target.value;
                                                    });
                                                }}
                                            >
                                                <option value="stretch">stretch</option>
                                                <option value="center">center</option>
                                                <option value="flex-start">flex-start</option>
                                                <option value="flex-end">flex-end</option>
                                                <option value="baseline">baseline</option>
                                            </select>
                                        </div>
                                    </div>
                                    <SizeInput
                                        label={'Gap'}
                                        value={selectedComponent.defaultProps?.style?.gap || 0}
                                        onChange={(v) => {
                                            updateComponent(selectedComponent.id, (node) => {
                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};
                                                node.defaultProps.style.gap = v;
                                            })
                                        }}
                                    />
                                </Heading>
                            )}
                            {display === 'grid' && (
                                <Heading icon={<Grid2x2 size={18} />} title="Grid Layout">
                                    <GridTemplateInput
                                        label="Grid Columns"
                                        value={selectedComponent.defaultProps?.style?.gridTemplateColumns}
                                        onChange={(v) =>
                                            updateComponent(selectedComponent.id, (node) => {
                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};
                                                node.defaultProps.style.gridTemplateColumns = v;
                                            })
                                        }
                                    />

                                    <GridTemplateInput
                                        label="Grid Rows"
                                        value={selectedComponent.defaultProps?.style?.gridTemplateRows}
                                        onChange={(v) =>
                                            updateComponent(selectedComponent.id, (node) => {
                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};
                                                node.defaultProps.style.gridTemplateRows = v;
                                            })
                                        }
                                    />
                                    <SliderInput
                                        label="Gap"
                                        value={parseFloat(selectedComponent.defaultProps?.style?.gap || 0)}
                                        unit="px"
                                        min={0}
                                        max={100}
                                        onChange={(v) =>
                                            updateComponent(selectedComponent.id, (node) => {
                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};
                                                node.defaultProps.style.gap = `${v}px`;
                                            })
                                        }
                                    />
                                    <div className="double-input">
                                        <div className="input-child">
                                            <label>Justify Items</label>
                                            <select
                                                value={selectedComponent.defaultProps?.style?.justifyItems || "stretch"}
                                                onChange={(e) =>
                                                    updateComponent(selectedComponent.id, (node) => {
                                                        node.defaultProps ??= {};
                                                        node.defaultProps.style ??= {};
                                                        node.defaultProps.style.justifyItems = e.target.value;
                                                    })
                                                }
                                            >
                                                <option value="start">start</option>
                                                <option value="center">center</option>
                                                <option value="end">end</option>
                                                <option value="stretch">stretch</option>
                                            </select>
                                        </div>

                                        <div className="input-child">
                                            <label>Align Items</label>
                                            <select
                                                value={selectedComponent.defaultProps?.style?.alignItems || "stretch"}
                                                onChange={(e) =>
                                                    updateComponent(selectedComponent.id, (node) => {
                                                        node.defaultProps ??= {};
                                                        node.defaultProps.style ??= {};
                                                        node.defaultProps.style.alignItems = e.target.value;
                                                    })
                                                }
                                            >
                                                <option value="start">start</option>
                                                <option value="center">center</option>
                                                <option value="end">end</option>
                                                <option value="stretch">stretch</option>
                                            </select>
                                        </div>
                                    </div>
                                </Heading>
                            )}


                            <Heading icon={<Space size={18} />} title={'Spacing'} >
                                <div className="spacing-content">
                                    <FourSideInput
                                        label="Padding"
                                        names={["Top", "Right", "Bottom", "Left"]}
                                        values={[
                                            parseInt(selectedComponent.defaultProps?.style?.paddingTop) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.paddingRight) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.paddingBottom) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.paddingLeft) ?? 0,
                                        ]}
                                        onChange={(index, value) => {
                                            updateComponent(selectedComponent.id, (node) => {
                                                const map = [
                                                    "paddingTop",
                                                    "paddingRight",
                                                    "paddingBottom",
                                                    "paddingLeft",
                                                ];

                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};

                                                const actualValue = String(value).replace("px", "");

                                                node.defaultProps.style[map[index]] = `${actualValue}px`;
                                            });
                                        }}
                                    />
                                    <FourSideInput
                                        label="Margin"
                                        names={["Top", "Right", "Bottom", "Left"]}
                                        values={[
                                            parseInt(selectedComponent.defaultProps?.style?.marginTop) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.marginRight) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.marginBottom) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.marginLeft) ?? 0,
                                        ]}
                                        onChange={(index, value) => {
                                            updateComponent(selectedComponent.id, (node) => {
                                                const map = [
                                                    "marginTop",
                                                    "marginRight",
                                                    "marginBottom",
                                                    "marginLeft",
                                                ];

                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};

                                                const actualValue = String(value).replace("px", "");

                                                node.defaultProps.style[map[index]] = `${actualValue}px`;
                                            });
                                        }}
                                    />
                                </div>
                            </Heading>

                            <Heading icon={<Grid2x2 size={18} />} title={'Border'}>
                                <div className="border">
                                    <div className="border-properties">
                                        <div className='border-prop'>
                                            <label htmlFor="">Width</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={parseFloat(selectedComponent.defaultProps?.style?.borderWidth) || 0}
                                                onChange={(e) => {
                                                    updateComponent(selectedComponent.id, (node) => {
                                                        node.defaultProps ??= {};
                                                        node.defaultProps.style ??= {};
                                                        node.defaultProps.style.borderWidth = `${e.target.value}px`;
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className='border-prop'>
                                            <label htmlFor="">Style</label>
                                            <select value={selectedComponent.defaultProps?.style?.borderStyle} onChange={(e) => {
                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.defaultProps ??= {};
                                                    node.defaultProps.style ??= {};
                                                    node.defaultProps.style.borderStyle = e.target.value;
                                                })
                                            }}>
                                                <option value="solid">solid</option>
                                                <option value="dashed">dashed</option>
                                                <option value="dotted">dotted</option>
                                                <option value="double">double</option>
                                                <option value="none">none</option>
                                            </select>
                                        </div>
                                    </div>
                                    <ColorPalette
                                        value={selectedComponent.defaultProps?.style?.borderColor ?? "#000000"}
                                        onChange={(v) =>
                                            updateComponent(selectedComponent.id, (node) => {
                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};
                                                node.defaultProps.style.borderColor = v;
                                            })
                                        }
                                    />

                                    <FourSideInput
                                        label="Border Radius"
                                        names={["Top", "Right", "Bottom", "Left"]}
                                        values={[
                                            parseInt(selectedComponent.defaultProps?.style?.borderTopLeftRadius) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.borderTopRightRadius) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.borderBottomRightRadius) ?? 0,
                                            parseInt(selectedComponent.defaultProps?.style?.borderBottomLeftRadius) ?? 0,
                                        ]}
                                        onChange={(index, value) => {
                                            updateComponent(selectedComponent.id, (node) => {
                                                const map = [
                                                    "borderTopLeftRadius",
                                                    "borderTopRightRadius",
                                                    "borderBottomRightRadius",
                                                    "borderBottomLeftRadius",
                                                ];

                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};

                                                const actualValue = String(value).replace("px", "");

                                                node.defaultProps.style[map[index]] = `${actualValue}px`;
                                            });
                                        }}
                                    />
                                </div>
                            </Heading>

                            <Heading icon={<MountainSnow size={18} />} title={'Background'}>
                                <div className='background-content'>
                                    <label htmlFor="">Background color</label>
                                    <ColorPalette
                                        value={selectedComponent.defaultProps?.style?.backgroundColor ?? "#000000"}
                                        onChange={(v) =>
                                            updateComponent(selectedComponent.id, (node) => {
                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};
                                                node.defaultProps.style.backgroundColor = v;
                                            })
                                        }
                                    />
                                    <SliderInput label={'opacity'} value={Number((selectedComponent.defaultProps?.style?.opacity ?? 1) * 100).toFixed(0)} min={0} max={100} unit='%' onChange={(v) => {
                                        updateComponent(selectedComponent.id, (node) => {
                                            node.defaultProps ??= {};
                                            node.defaultProps.style ??= {};
                                            node.defaultProps.style.opacity = v / 100;
                                        });
                                    }} />
                                    {selectedComponent.tag !== "img" && (
                                        <>
                                            <ImageUpload selectedComponent={selectedComponent} updateComponent={updateComponent} label={'Background image'} />
                                            <div className="three-input">
                                                <div>
                                                    <label htmlFor="">bg-Repeat</label>
                                                    <select
                                                        value={selectedComponent.defaultProps?.style?.backgroundRepeat || 'repeat'}
                                                        onChange={(e) => {
                                                            updateComponent(selectedComponent.id, (node) => {
                                                                node.defaultProps ??= {};
                                                                node.defaultProps.style ??= {};
                                                                node.defaultProps.style.backgroundRepeat = e.target.value;
                                                            })
                                                        }}
                                                    >
                                                        <option value="repeat">Repeat</option>
                                                        <option value="no-repeat">No-repeat</option>
                                                        <option value="repeat-X">Repeat-X</option>
                                                        <option value="repeat-Y">Repeat-Y</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="">bg-position</label>
                                                    <select
                                                        value={selectedComponent.defaultProps?.style?.backgroundPosition || 'center'}
                                                        onChange={(e) => {
                                                            updateComponent(selectedComponent.id, (node) => {
                                                                node.defaultProps ??= {};
                                                                node.defaultProps.style ??= {};
                                                                node.defaultProps.style.backgroundPosition = e.target.value;
                                                            })
                                                        }}
                                                    >
                                                        <option value="center">Center</option>
                                                        <option value="top">Top</option>
                                                        <option value="bottom">Bottom</option>
                                                        <option value="left">Left</option>
                                                        <option value="right">Right</option>

                                                        <option value="top left">Top Left</option>
                                                        <option value="top center">Top Center</option>
                                                        <option value="top right">Top Right</option>
                                                        <option value="center left">Center Left</option>
                                                        <option value="center right">Center Right</option>
                                                        <option value="bottom left">Bottom Left</option>
                                                        <option value="bottom center">Bottom Center</option>
                                                        <option value="bottom right">Bottom Right</option>

                                                        <option value="0% 0%">0% 0%</option>
                                                        <option value="50% 50%">50% 50%</option>
                                                        <option value="100% 100%">100% 100%</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="">bg-size</label>
                                                    <select
                                                        value={selectedComponent.defaultProps?.style?.backgroundSize || 'auto'}
                                                        onChange={(e) => {
                                                            updateComponent(selectedComponent.id, (node) => {
                                                                node.defaultProps ??= {};
                                                                node.defaultProps.style ??= {};
                                                                node.defaultProps.style.backgroundSize = e.target.value;
                                                            })
                                                        }}
                                                    >
                                                        <option value="auto">Auto</option>
                                                        <option value="cover">Cover</option>
                                                        <option value="contain">Contain</option>
                                                        <option value="100% 100%">Stretch</option>
                                                        <option value="50%">50%</option>
                                                        <option value="75%">75%</option>
                                                        <option value="25%">25%</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="three-input">
                                                <div>
                                                    <label htmlFor="">bg-origin</label>
                                                    <select
                                                        value={selectedComponent.defaultProps?.style?.backgroundOrigin || 'repeat'}
                                                        onChange={(e) => {
                                                            updateComponent(selectedComponent.id, (node) => {
                                                                node.defaultProps ??= {};
                                                                node.defaultProps.style ??= {};
                                                                node.defaultProps.style.backgroundOrigin = e.target.value;
                                                            })
                                                        }}
                                                    >
                                                        <option value="padding-box">padding-box</option>
                                                        <option value="border-box">border-box</option>
                                                        <option value="content-box">content-box</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="">bg-clip</label>
                                                    <select
                                                        value={selectedComponent.defaultProps?.style?.backgroundClip || 'center'}
                                                        onChange={(e) => {
                                                            updateComponent(selectedComponent.id, (node) => {
                                                                node.defaultProps ??= {};
                                                                node.defaultProps.style ??= {};
                                                                node.defaultProps.style.backgroundClip = e.target.value;
                                                            })
                                                        }}
                                                    >
                                                        <option value="border-box">border-box</option>
                                                        <option value="padding-box">padding-box</option>
                                                        <option value="content-box">content-box</option>
                                                        <option value="text">text</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="">bg-attachment</label>
                                                    <select
                                                        value={selectedComponent.defaultProps?.style?.backgroundAttachment || 'auto'}
                                                        onChange={(e) => {
                                                            updateComponent(selectedComponent.id, (node) => {
                                                                node.defaultProps ??= {};
                                                                node.defaultProps.style ??= {};
                                                                node.defaultProps.style.backgroundAttachment = e.target.value;
                                                            })
                                                        }}
                                                    >
                                                        <option value="scroll">scroll</option>
                                                        <option value="fixed">fixed</option>
                                                        <option value="local">local</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </div>
                            </Heading>
                            {selectedComponent.tag !== "img" && (
                                <>
                                    <Heading icon={<Type size={18} />} title={'Typography'} >
                                        <div className="typo">
                                            <div className="double-input">
                                                <div className='input-child'>
                                                    <label htmlFor="">Font Size</label>
                                                    <input type="number" max={72} value={parseFloat(selectedComponent.defaultProps?.style?.fontSize) || 16} onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.style ??= {};
                                                            node.defaultProps.style.fontSize = `${e.target.value}px`
                                                        })
                                                    }} />
                                                </div>
                                                <div className='input-child'>
                                                    <label htmlFor="">Font Weight</label>
                                                    <select value={selectedComponent.defaultProps?.style?.fontWeight || 400} onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.style ??= {};
                                                            node.defaultProps.style.fontWeight = `${e.target.value}`
                                                        })
                                                    }}>  +77.0°C
                                                        <option value="100">100</option>
                                                        <option value="200">200</option>
                                                        <option value="300">300</option>
                                                        <option value="400">400</option>
                                                        <option value="500">500</option>
                                                        <option value="600">600</option>
                                                        <option value="700">700</option>
                                                        <option value="800">800</option>
                                                        <option value="900">900</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="color">
                                                <label htmlFor="" id='text-color'>Text color</label>
                                                <ColorPalette
                                                    value={selectedComponent.defaultProps?.style?.color || "#000000"}
                                                    onChange={(v) =>
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.style ??= {};
                                                            node.defaultProps.style.color = v;
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="double-input">
                                                <div className='input-child'>
                                                    <label htmlFor="">Text Align</label>
                                                    <select value={selectedComponent.defaultProps?.style?.textAlign || "left"} onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.style ??= {};
                                                            node.defaultProps.style.textAlign = e.target.value;
                                                        })
                                                    }}>
                                                        <option value="left">⬅ Align Left</option>
                                                        <option value="center">⬌ Align Center</option>
                                                        <option value="right">➡ Align Right</option>
                                                        <option value="justify">☰ Justify</option>
                                                    </select>
                                                </div>
                                                <div className='input-child'>
                                                    <label htmlFor="">Line Height</label>
                                                    <input type="number" value={selectedComponent.defaultProps?.style?.lineHeight || 1} onChange={(e) => {
                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.style ??= {};
                                                            node.defaultProps.style.lineHeight = e.target.value;
                                                        })
                                                    }} />
                                                </div>
                                            </div>
                                            <div className="font-input">
                                                <label htmlFor="">Font family</label>
                                                <select
                                                    value={selectedComponent.defaultProps?.style?.fontFamily || ""}

                                                    onChange={(e) => {
                                                        const font = e.target.value;

                                                        WebFont.load({
                                                            google: { families: [font] }
                                                        })

                                                        updateComponent(selectedComponent.id, (node) => {
                                                            node.defaultProps ??= {};
                                                            node.defaultProps.style ??= {};
                                                            node.defaultProps.style.fontFamily = e.target.value;
                                                        })
                                                    }}
                                                >
                                                    <option value="">Default</option>
                                                    <option value="Roboto">Roboto</option>
                                                    <option value="Poppins">Poppins</option>
                                                    <option value="Open Sans">Open Sans</option>
                                                    <option value="Montserrat">Montserrat</option>
                                                    <option value="Inter">Inter</option>
                                                    <option value="Lato">Lato</option>
                                                    <option value="Nunito">Nunito</option>
                                                    <option value="Raleway">Raleway</option>
                                                    <option value="Playfair Display">Playfair Display</option>
                                                    <option value="Ubuntu">Ubuntu</option>
                                                </select>
                                            </div>
                                        </div>
                                    </Heading>
                                </>
                            )}

                            <Heading icon={<TableRowsSplit size={18} />} title={'Effects'}>
                                <div className="effects-content">
                                    <FourSideInput
                                        label="Box Shadow"
                                        names={["X", "Y", "Blur", "Spread"]}
                                        values={[
                                            selectedComponent.defaultProps?.style?.boxShadowX ?? 0,
                                            selectedComponent.defaultProps?.style?.boxShadowY ?? 0,
                                            selectedComponent.defaultProps?.style?.boxShadowBlur ?? 0,
                                            selectedComponent.defaultProps?.style?.boxShadowSpread ?? 0,
                                        ]}
                                        onChange={(index, value) => {
                                            updateComponent(selectedComponent.id, (node) => {
                                                const shadow = {
                                                    x: node.defaultProps?.style?.boxShadowX ?? 0,
                                                    y: node.defaultProps?.style?.boxShadowY ?? 0,
                                                    blur: node.defaultProps?.style?.boxShadowBlur ?? 0,
                                                    spread: node.defaultProps?.style?.boxShadowSpread ?? 0,
                                                    color: node.defaultProps?.style?.boxShadowColor ?? "rgba(0,0,0,0.25)",
                                                };

                                                const map = ["x", "y", "blur", "spread"];
                                                shadow[map[index]] = value;
                                                node.defaultProps ??= {};
                                                node.defaultProps.style ??= {};
                                                node.defaultProps.style.boxShadowX = shadow.x;
                                                node.defaultProps.style.boxShadowY = shadow.y;
                                                node.defaultProps.style.boxShadowBlur = shadow.blur;
                                                node.defaultProps.style.boxShadowSpread = shadow.spread;

                                                node.defaultProps.style.boxShadow =
                                                    `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
                                            });
                                        }}
                                    />

                                    <div className="color">
                                        <label htmlFor="" id='text-color'>Shadow color</label>
                                        <ColorPalette
                                            value={selectedComponent.defaultProps?.style?.boxShadowColor ?? "#000000"}
                                            onChange={(v) =>
                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.defaultProps ??= {};
                                                    node.defaultProps.style ??= {};

                                                    const x = node.defaultProps.style.boxShadowX ?? 0;
                                                    const y = node.defaultProps.style.boxShadowY ?? 0;
                                                    const blur = node.defaultProps.style.boxShadowBlur ?? 0;
                                                    const spread = node.defaultProps.style.boxShadowSpread ?? 0;

                                                    node.defaultProps.style.boxShadowColor = v;

                                                    node.defaultProps.style.boxShadow =
                                                        `${x}px ${y}px ${blur}px ${spread}px ${v}`;
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="scale">
                                    <div>
                                        <label>Scale</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min={0}
                                            value={selectedComponent.defaultProps?.style?.scale ?? 1}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);

                                                updateComponent(selectedComponent.id, (node) => {
                                                    node.defaultProps ??= {};
                                                    node.defaultProps.style ??= {};
                                                    node.defaultProps.style.scale = val;
                                                });
                                            }}
                                        />
                                    </div>
                                </div>

                            </Heading>
                            <Heading icon={<MonitorSmartphone size={18} />} title={"Custom CSS"} >
                                <>
                                    <div className="custom-css">
                                        <div>
                                            <label>media query</label>
                                            <CodeMirror
                                                key={userClass ? "editable" : "readonly"}
                                                editable={classInput.trim().length > 0}
                                                height="300px"
                                                theme={vscodeDark}
                                                extensions={[
                                                    css(),
                                                    readonlyClickHandler,
                                                    EditorState.readOnly.of(classInput.trim().length === 0)
                                                ]}
                                                value={selectedComponent?.defaultProps?.mediaquery?.style ?? ""}
                                                onChange={(value) => {

                                                    if (!userClass) {
                                                        toast.error("ClassName is Required!", { id: "all-need" });
                                                        return;
                                                    }

                                                    updateComponent(selectedComponent.id, (node) => {
                                                        node.defaultProps ??= {};
                                                        node.defaultProps.mediaquery ??= {};
                                                        node.defaultProps.mediaquery.style = value;
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            </Heading>
                        </div>
                    )}
                    {activeTab === 'resources' && (
                        <div className="properties-content">
                            {!FILE_IMPORT_TAGS.includes(selectedComponent.tag) && (
                                <div className='warn-msg'>
                                    <p>This component doesn't support file upload</p>
                                </div>
                            )}
                            {FILE_IMPORT_TAGS.includes(selectedComponent.tag) && (
                                <>
                                    <Heading icon={<FileUp size={18} />} title={'External Data Source'}>
                                        <FileUpload onFilesAdded={handleFiles} />
                                        <ImportedFiles files={filteredFiles} onDelete={deleteFile} />
                                    </Heading>

                                    <Heading icon={<Webhook size={18} />} title={'API Connection'}>

                                        <div className="api-form">
                                            <label>API Endpoint</label>
                                            <input
                                                type="text"
                                                placeholder="https://api.example.com/data"
                                                value={apiUrl}
                                                onChange={(e) => setApiUrl(e.target.value)}
                                            />

                                            <button
                                                className="api-button"
                                                onClick={fetchApiData}
                                            >
                                                {loadingApi ? "Fetching..." : "Fetch Data"}
                                            </button>
                                            {filteredApi.map((api) => (
                                                <div key={api.id} className="api-card">

                                                    <div className="api-card-icon">
                                                        <Cloud size={16} strokeWidth={2} />
                                                    </div>

                                                    <div className="api-card-info">
                                                        <span className="api-card-url" title={api.url}>
                                                            {api.url.replace(/^https?:\/\//, "")}
                                                        </span>
                                                        <div className="api-card-meta">
                                                            <span
                                                                className="api-card-dot"
                                                                style={{ background: api.status === "connected" ? "#3dbd6e" : "#e0a030" }}
                                                            />
                                                            <span>{api.status}</span>
                                                        </div>
                                                    </div>

                                                    <Trash2
                                                        size={14}
                                                        strokeWidth={2}
                                                        className="api-card-trash"
                                                        onClick={() => deleteApi(api.id)}
                                                    />

                                                </div>
                                            ))}
                                        </div>
                                    </Heading>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div >
            <div className="delete-box">
                <button
                    className="delete-button"
                    onClick={deleteComponent}
                    disabled={!selectedComponent}
                >
                    Delete {selectedComponent.label}
                </button>
            </div>
        </aside >
    )
}

const Heading = ({ icon, title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="properties-section">
            <button
                className="properties-toggle"
                onClick={() => setOpen(prev => !prev)}
                type="button"
            >
                <div>
                    <span className="btn-icon">{icon}</span>
                    <span className='title'>{title}</span>
                </div>

                <span>
                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}

                </span>
            </button>

            {open && (
                <div className="properties-body">
                    {children}
                </div>
            )}
        </div>
    );
};

const FourSideInput = ({ label, values = [0, 0, 0, 0], names, onChange }) => {
    const labelNames = names;

    return (
        <div className="four-side">
            <label className="four-side-title">{label}</label>

            <div className="four-side-grid">
                {values.map((val, index) => (
                    <div key={index}>
                        <span>{labelNames[index]}</span>
                        <input
                            type="number"
                            value={val}
                            min={0}
                            onChange={(e) =>
                                onChange(index, e.target.value)
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const ColorPalette = ({ value = "", onChange }) => {
    const hexValue = tinycolor(value).isValid()
        ? tinycolor(value).toHexString()
        : "#000000";
    return (
        <div className="color-pallette">
            <input
                type="color"
                value={hexValue}
                onChange={(e) => onChange(e.target.value)}
            />

            <div className="color-box">
                <input
                    className="color-input"
                    type="text"
                    value={value ?? ""}
                    placeholder="#fff, rgb(255,0,0), rgba(...)"
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }) => {
    return (
        <>
            <div className="slider-input">
                <div className="slider-header">
                    <label>{label}</label>
                </div>
                <div className="slider-main">
                    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                    <span className="slider-value">{value}{unit}</span>
                </div>
            </div>
        </>
    )
}

const GridTemplateInput = ({ label, value, onChange }) => {
    return (
        <div className="long-input">
            <label>{label}</label>
            <input
                className='grid-input'
                type="text"
                placeholder="e.g. repeat(3, 1fr)"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

const FileUpload = ({ onFilesAdded }) => {
    const inputRef = useRef(null);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => onFilesAdded(e.target.files)}
            />

            <div
                className="upload-box"
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    onFilesAdded(e.dataTransfer.files);
                }}
            >
                Drop files here or <span>browse</span>
            </div>
        </>
    );
};

const splitValue = (val) => {
    if (!val) return { number: "", unit: "px" };

    if (val === "auto") {
        return { number: "", unit: "auto" };
    }

    const match = val.match(/^([\d.]+)(px|%|rem|em|vw|vh)$/);

    if (!match) {
        return { number: "", unit: "px" };
    }

    return {
        number: match[1],
        unit: match[2],
    };
};

const SizeInput = ({ label, value, onChange, maxPx }) => {
    const { number, unit } = splitValue(value);

    const update = (num, un) => {
        if (un === "auto") return onChange("auto");

        const value = Number(num);

        if (un === "px" && maxPx && value > maxPx) {
            onChange(`${maxPx}px`);
            return;
        }

        if (!num) return onChange(`0${un}`);

        onChange(`${num}${un}`);
    };

    return (
        <div className="long-input">
            <label>{label}</label>

            <div>
                <input
                    type="number"
                    min={0}
                    value={number}
                    disabled={unit === "auto"}
                    onChange={(e) => update(e.target.value, unit)}
                />

                <select
                    value={unit}
                    onChange={(e) => update(number, e.target.value)}
                >
                    {UNITS.map((u) => (
                        <option key={u} value={u}>
                            {u}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const DynamicProps = ({ selectedComponent, updateComponent }) => {
    const tag = selectedComponent?.tag;
    const props = COMPONENT_PROPS_MAP[tag];
    if (!props || props.length === 0) return null;
    const checkBoxInput = props.filter(e => e.type === 'checkbox');
    const otherInputs = props.filter(e => e.type !== 'checkbox');
    const inputType = selectedComponent?.defaultProps?.type || "text";

    if (!props || props.length === 0) {
        return null;
    }

    const getValue = (key) => {
        return selectedComponent?.defaultProps?.[key] ?? "";
    }

    const handleChange = (key, value) => {
        updateComponent(selectedComponent.id, (node) => {
            node.defaultProps ??= {};
            node.defaultProps[key] = value;
        });
    }

    const filteredOtherInputs = otherInputs.filter((prop) => {
        if (selectedComponent.tag !== "input") return true;

        if (prop.key === "type") return true;

        if (inputType === "number") {
            return ["placeholder", "min", "max", "type"].includes(prop.key);
        }

        if (inputType === "checkbox" || inputType === "radio") {
            return false;
        }

        if (inputType === "text" || inputType === "email" || inputType === "password") {
            return ["placeholder", "minLength", "maxLength", "type"].includes(prop.key);
        }

        if (inputType === "tel") {
            return ["minLength", "maxLength", "placeholder"].includes(prop.key);
        }

        if (inputType === "date") {
            return ["min", "max"].includes(prop.key);
        }

        if (inputType === "url") {
            return ["minLength", "maxLength", "placeholder"].includes(prop.key);
        }

        return true;
    });

    const filteredCheckboxInputs = checkBoxInput.filter((prop) => {
        if (inputType === "checkbox" || inputType === "radio") {
            return ["type", "required", "disabled"].includes(prop.key);
        }

        return true;
    });

    return (
        <Heading icon={<Settings size={18} />} title={'Component-Properties'}>
            <div className='properties-general'>
                {filteredOtherInputs.map((prop) => (
                    <div key={prop.key} className='property-select'>

                        {prop.type === "text" && (
                            <>
                                <label htmlFor={prop.key}>{prop.label}</label>
                                <input
                                    className='property-input'
                                    id={prop.key}
                                    type="text"
                                    value={getValue(prop.key)}
                                    onChange={(e) => handleChange(prop.key, e.target.value)}
                                />
                            </>

                        )}

                        {prop.type === "number" && (
                            <>
                                <label htmlFor={prop.key}>{prop.label}</label>
                                <input
                                    className='property-input'
                                    id={prop.key}
                                    type="number"
                                    min={0}
                                    value={getValue(prop.key)}
                                    onChange={(e) => handleChange(prop.key, e.target.value)}
                                />
                            </>

                        )}

                        {prop.type === "select" && (
                            <>
                                <label htmlFor={prop.key}>{prop.label}</label>
                                <select
                                    id={prop.key}
                                    value={getValue(prop.key)}
                                    onChange={(e) => handleChange(prop.key, e.target.value)}
                                >
                                    {prop.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </>

                        )}
                    </div>
                ))}
                {filteredCheckboxInputs.length > 0 && (
                    <div className='checkbox-group'>
                        {filteredCheckboxInputs.map((prop) => (
                            <label key={prop.key} id="checkbox-row">
                                <input
                                    id='property-check'
                                    type="checkbox"
                                    checked={!!getValue(prop.key)}
                                    onChange={(e) => handleChange(prop.key, e.target.checked)}
                                />
                                <span>{prop.label}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </Heading>
    );
};

const SelectOption = ({ selectedComponent, updateComponent }) => {
    const options = selectedComponent.children ?? [];

    const addOption = () => {
        updateComponent(selectedComponent.id, (node) => {
            node.children ??= [];
            node.children.push({
                tag: 'option',
                content: "New Option",
                defaultProps: { value: Date.now().toString() }
            })
        })
    }

    const updateOption = (index, value) => {
        updateComponent(selectedComponent.id, (node) => {
            node.children ??= [];

            if (!node.children[index]) return;

            node.children[index].content = value;
        })
    }

    const deleteOption = (index) => {
        updateComponent(selectedComponent.id, (node) => {
            node.children ??= [];

            if (!node.children[index]) return;

            node.children.splice(index, 1);
        });
    }

    return (
        <>
            <Heading icon={<ListPlus size={18} />} title={'Select options'}>
                {options.map((option, index) => (
                    <>
                        <div key={index} className='image-input option-row'>
                            <input
                                type="text"
                                value={option.content || ""}
                                onChange={(e) => {
                                    updateOption(index, e.target.value);
                                }} />

                            <button onClick={() => deleteOption(index)}>Delete</button>
                        </div>
                    </>
                ))}
                <button onClick={addOption} className='add-option'>Add option</button>
            </Heading>
        </>
    )
};



export default RightSideBar