import * as React from "react";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import SetEditForm from "../forms/SetEditForm"


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

const RadialMenuPopover = ({ setId, closeMenu }) => {
    const [isEditing, setIsEditing] = useState(false);

    const menuItems = [
        { label: "Edit", action: () => setIsEditing(true), color: "#FFD700" },
        { label: "Delete", action: () => console.log("Delete Set"), color: "#D90000" },
        { label: "Duplicate", action: () => console.log("Duplicate Set"), color: "#008000" },
    ];
    
    

    const cx = 50; // Center X
    const cy = 50; // Center Y
    const r = 50;  // Radius


    return (
        <Popover.Content sideOffset={10} className="relative w-48 h-48 bg-transparent overflow-visible">
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
