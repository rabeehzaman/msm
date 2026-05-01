"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type SelectContextValue = {
  inNativeSelect: boolean
}

const SelectContext = React.createContext<SelectContextValue>({
  inNativeSelect: false,
})

type SelectProps = Omit<React.ComponentProps<"select">, "onChange"> & {
  onValueChange?: (value: string) => void
}

type SelectTriggerProps = React.ComponentProps<"button"> & {
  size?: "sm" | "default"
}

type SelectValueProps = React.ComponentProps<"span"> & {
  placeholder?: string
}

type SelectItemProps = React.ComponentProps<"option"> & {
  value: string
  label?: string
}

function getElementName(type: React.ElementType | string) {
  return typeof type === "function" ? type.displayName : undefined
}

function getElementChildren(element: React.ReactElement): React.ReactNode {
  const props = element.props as { children?: React.ReactNode }
  return props.children
}

function getNodeText(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(getNodeText).join("")
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return getNodeText(children.props.children)
  }
  return ""
}

function collectItems(children: React.ReactNode): React.ReactElement<SelectItemProps>[] {
  const items: React.ReactElement<SelectItemProps>[] = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return
    }

    const childName = getElementName(child.type)
    if (childName === "SelectItem") {
      items.push(child as React.ReactElement<SelectItemProps>)
      return
    }

    items.push(...collectItems(getElementChildren(child)))
  })

  return items
}

function findTrigger(children: React.ReactNode): React.ReactElement<SelectTriggerProps> | null {
  let trigger: React.ReactElement<SelectTriggerProps> | null = null

  React.Children.forEach(children, (child) => {
    if (trigger || !React.isValidElement(child)) {
      return
    }
    if (getElementName(child.type) === "SelectTrigger") {
      trigger = child as React.ReactElement<SelectTriggerProps>
    }
  })

  return trigger
}

function findValue(children: React.ReactNode): React.ReactElement<SelectValueProps> | null {
  let value: React.ReactElement<SelectValueProps> | null = null

  React.Children.forEach(children, (child) => {
    if (value || !React.isValidElement(child)) {
      return
    }
    if (getElementName(child.type) === "SelectValue") {
      value = child as React.ReactElement<SelectValueProps>
      return
    }
    value = findValue(getElementChildren(child))
  })

  return value
}

function Select({
  children,
  className,
  value,
  defaultValue,
  onValueChange,
  disabled,
  required,
  name,
  id,
  ...props
}: SelectProps) {
  const trigger = findTrigger(children)
  const valueNode = findValue(children)
  const items = collectItems(children)
  const placeholder = valueNode?.props.placeholder
  const selectId = id ?? trigger?.props.id
  const size = trigger?.props.size ?? "default"
  const valueProps =
    value === undefined
      ? { defaultValue: defaultValue ?? "" }
      : { value }

  return (
    <div className={cn("relative inline-flex", className)}>
      <SelectContext.Provider value={{ inNativeSelect: true }}>
        <select
          id={selectId}
          name={name}
          {...valueProps}
          disabled={disabled}
          required={required}
          onChange={(event) => onValueChange?.(event.target.value)}
          className={cn(
            "flex w-fit appearance-none items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-8 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50",
            trigger?.props.className
          )}
          data-size={size}
          aria-invalid={trigger?.props["aria-invalid"]}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {items.map((item) => (
            <SelectItem key={item.props.value} {...item.props} />
          ))}
        </select>
      </SelectContext.Provider>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
Select.displayName = "Select"

function SelectGroup({ children }: React.ComponentProps<"div">) {
  return <>{children}</>
}
SelectGroup.displayName = "SelectGroup"

function SelectValue({ children, placeholder, className, ...props }: SelectValueProps) {
  return (
    <span
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    >
      {children ?? placeholder}
    </span>
  )
}
SelectValue.displayName = "SelectValue"

function SelectTrigger({ children }: SelectTriggerProps) {
  return <>{children}</>
}
SelectTrigger.displayName = "SelectTrigger"

function SelectContent({ children }: React.ComponentProps<"div">) {
  return <>{children}</>
}
SelectContent.displayName = "SelectContent"

function SelectLabel({ children }: React.ComponentProps<"div">) {
  return <>{children}</>
}
SelectLabel.displayName = "SelectLabel"

function SelectItem({
  children,
  label,
  value,
  ...props
}: SelectItemProps) {
  const { inNativeSelect } = React.useContext(SelectContext)
  const optionLabel = label ?? getNodeText(children)

  if (!inNativeSelect) {
    return null
  }

  return (
    <option value={value} {...props}>
      {optionLabel}
    </option>
  )
}
SelectItem.displayName = "SelectItem"

function SelectSeparator() {
  return null
}
SelectSeparator.displayName = "SelectSeparator"

function SelectScrollUpButton() {
  return null
}
SelectScrollUpButton.displayName = "SelectScrollUpButton"

function SelectScrollDownButton() {
  return null
}
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
