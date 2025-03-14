import * as React from "react";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import SetEditForm from "../sets/SetEditForm"
import { useWorkoutContext } from "../../providers/WorkoutContext";


// Function to generate SVG path for a 120-degree pie slice
const createPieSlicePath = (index, cx, cy, r) => {
    const startAngle = (index * 120) - 90; // Offset so first slice starts at top
    const endAngle = startAngle + 120;

    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);

    return `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 0,1 ${x2},${y2} Z`;
};

const RadialMenuPopover = ({ setId, workoutId, closeMenu }) => {
    const { duplicateSet, deleteSet, sets } = useWorkoutContext();
    const [isEditing, setIsEditing] = useState(false);

    const menuItems = [
        { label: "Edit", action: () => setIsEditing(true), color: "#FFD700" },
        { label: "Delete", action: async () => {
            if (!setId || !workoutId) {
                console.error("❌ Missing setId or workoutId:", { setId, workoutId });
                return;
            }
            await deleteSet(workoutId, setId);
            closeMenu();
        }, color: "#D90000" },
    
        { label: "Duplicate", action: async () => {
            if (!setId || !workoutId) {
                console.error("❌ Missing setId or workoutId:", { setId, workoutId });
                return;
            }
    
            try {
                // ✅ Find the correct setData using the `sets` array
                const setData = sets.find(set => set.id === setId);
                if (!setData) {
                    console.error("❌ Set data not found:", { setId });
                    return;
                }
    
                console.log("✅ Found set data for duplication:", setData);
    
                // ✅ Call duplicateSet with full set data
                await duplicateSet(workoutId, setData);
                closeMenu();
            } catch (error) {
                console.error("❌ Error duplicating set:", error);
            }
        }, color: "#008000" },
    ];
    
    
    

    const cx = 50; // Center X
    const cy = 50; // Center Y
    const r = 50;  // Radius


    return (
        <Popover.Content
            sideOffset={10}
            align="center"
            className="relative bg-transparent overflow-visible"
            style={{
                width: "auto", // Prevents forced box size
                height: "auto", // Ensures natural SVG fit
                border: "none", // Removes any border
                boxShadow: "none", // Removes unwanted shadows
                outline: "none", // Prevents focus outline issues
                minWidth: "300px",
                maxWidth: "400px", // Adjust as needed
            }}
        >
            {isEditing ? (
                <SetEditForm setId={setId} onClose={() => setIsEditing(false)} />
            ) : (
                <svg viewBox="-10 -10 120 120" className="w-full h-full">
                    {menuItems.map((item, index) => (
                        <motion.path
                            key={index}
                            d={createPieSlicePath(index, cx, cy, r)}
                            fill={item.color}
                            className="cursor-pointer"
                            whileHover={{ scale: 1.05, opacity: 0.9 }}
                            onClick={item.action}
                        />
                    ))}
                </svg>
            )}
        </Popover.Content>


    );
};

export default RadialMenuPopover;
