import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '../../lib/utils'

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={cn('border-b', className)}
        {...props}
    />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                ref={ref}
                className={cn(
                    'flex flex-1 items-center justify-between py-2 text-lg font-bold text-yellow-400 transition hover:text-yellow-300',
                    className
                )}
                {...props}
            >
                {children}
                <span className="ml-2">▼</span>
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    )
)
AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef(
    ({ className, children, ...props }, ref) => (
        <AccordionPrimitive.Content
            ref={ref}
            className={cn(
                'overflow-hidden text-white transition-all duration-300',
                className
            )}
            {...props}
        >
            <div className="p-4">{children}</div>
        </AccordionPrimitive.Content>
    )
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
