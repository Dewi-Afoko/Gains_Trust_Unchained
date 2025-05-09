import React from 'react'
import { useState } from 'react'
import * as Dropdown from '@radix-ui/react-dropdown-menu'
import PanelButton from './PanelButton'

export function DropdownMenu({ triggerLabel, items }) {
    return (
        <Dropdown.Root>
            <Dropdown.Trigger asChild>
                <PanelButton className="bg-gray-800 hover:bg-gray-700 border-gray-900/80 text-white font-bold px-4 py-2 w-auto">
                    {triggerLabel}
                </PanelButton>
            </Dropdown.Trigger>

            <Dropdown.Content
                className="bg-black text-yellow-300 rounded p-2 shadow-md w-48"
                sideOffset={5}
            >
                {items.map((item, index) => (
                    <Dropdown.Item
                        key={index}
                        className="p-2 hover:bg-red-800 cursor-pointer"
                        onSelect={item.onClick}
                    >
                        {item.label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Content>
        </Dropdown.Root>
    )
}
