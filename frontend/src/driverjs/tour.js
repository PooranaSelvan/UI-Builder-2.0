import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";

export const homeTour = () => {
     const driverObj = driver({
          showProgress: true,
          showButtons: ["close", "next", "previous"],
          popoverClass: 'driverjs-theme',
          steps: [
               { popover: { title: '👋 Welcome to Sirpam UI Builder', description: 'Sirpam gives you the power of development with the simplicity of drag & drop.', side: "left", align: 'start' } },
               { element: '#demo-btn', popover: { title: 'Watch the Magic in Action', description: 'Curious how it works?\n\nTake a quick demo tour', side: "left", align: 'start' } },
               { element: '#start-build', popover: { title: 'Start Building Now', description: 'Click here and transform your ideas into real and functional interfaces.', side: "left", align: 'start' } }
          ]
     });

     driverObj.drive();

     let tour = JSON.parse(localStorage.getItem("sirpam-tour")) || {};
     tour.home = "done";
     localStorage.setItem("sirpam-tour", JSON.stringify(tour));
};


export const dashBoardTour = () => {
     const driverObj = driver({
          showProgress: true,
          showButtons: ["close", "next", "previous"],
          popoverClass: 'driverjs-theme',
          steps: [
               { element: '#cards-grid', popover: { title: 'Project Dashboard', description: 'Create new projects, manage existing ones, and continue building amazing interfaces.', side: "left", align: 'start' } }
          ]
     });

     driverObj.drive();

     let tour = JSON.parse(localStorage.getItem("sirpam-tour")) || {};
     tour.dashboard = "done";
     localStorage.setItem("sirpam-tour", JSON.stringify(tour));
};


export const workspaceTour = () => {
     const driverObj = driver({
          showProgress: true,
          showButtons: ["close", "next", "previous"],
          popoverClass: 'driverjs-theme',
          steps: [
               { element: '#left-panel-tour', popover: { title: 'Components Library', description: 'All your building blocks live here.\n\nDrag, drop and design.', side: "left", align: 'start' } },
               { element: '#canvas-tour', popover: { title: 'Design Canvas', description: 'This is where your creativity meets execution.', side: "left", align: 'start' } },
               { element: '#right-sidebar-tour', popover: { title: 'Style & Customize', description: 'Want it pixel-perfect?\n\nAdjust styles, tweak properties, and fully customize your components here.', side: "left", align: 'start' } },
               { element: '#topbar-tour', popover: { title: 'Control Center', description: 'Save your progress\n preview in real-time\n publish when you\'re ready to go live\n\nbuild preview and ship.', side: "left", align: 'start' } },
               { element: '#dock-tour', popover: { title: 'Precision Zoom', description: 'Design with accuracy.', side: "left", align: 'start' } }
          ]
     });

     driverObj.drive();

     let tour = JSON.parse(localStorage.getItem("sirpam-tour")) || {};
     tour.workspace = "done";
     localStorage.setItem("sirpam-tour", JSON.stringify(tour));
};



export const editorTour = () => {
     const driverObj = driver({
          showProgress: true,
          showButtons: ["close", "next", "previous"],
          popoverClass: 'driverjs-theme',
          steps: [
               { element: '#left-panel-tour', popover: { title: 'Build Custom Component', description: 'Design once. Use everywhere.', side: "left", align: 'start' } },
               { element: '#custom-json-tour', popover: { title: 'Import Custom JSON', description: 'Already have a JSON structure?\n\nPaste it here and let Sirpam instantly generate your UI.', side: "left", align: 'start' } }
          ]
     });

     driverObj.drive();

     let tour = JSON.parse(localStorage.getItem("sirpam-tour")) || {};
     tour.editor = "done";
     localStorage.setItem("sirpam-tour", JSON.stringify(tour));
};