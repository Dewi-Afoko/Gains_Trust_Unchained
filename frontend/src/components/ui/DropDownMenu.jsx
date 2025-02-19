import React from 'react'
import { useState } from 'react'
import * as Dropdown from '@radix-ui/react-dropdown-menu'

export function DropdownMenu({ triggerLabel, items }) {
    return (
        <Dropdown.Root>
            <Dropdown.Trigger asChild>
                <button className="bg-gray-700 text-white font-bold px-4 py-2 rounded hover:bg-gray-600">
                    {triggerLabel}
                </button>
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
