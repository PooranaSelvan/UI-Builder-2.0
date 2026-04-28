import { components } from "../data/componentData.js"
import { BasicComponents } from "../data/customComponentData.js"

const componentData = async (req, res) => {
    try {
        res.status(200).json({
            isSuccess: true,
            data: components,
            message: "Data has been received from the api successfully"
        })
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Data fetch failed"
        })
    }
}

const customComponentData = async (req, res) => {
    try {
        res.status(200).json({
            isSuccess: true,
            data: BasicComponents,
            message: "Data fetched successfully",
        })
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Data fetch failed"
        })
    }
}


export { componentData, customComponentData };