import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ControlSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}

export function ControlSlider({ 
  label, 
  value, 
  min, 
  max, 
  step = 0.1, 
  unit = '', 
  onChange 
}: ControlSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleSliderChange = (newValue: number[]) => {
    const val = newValue[0]
    setInputValue(val.toString())
    onChange(val)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    
    const numVal = parseFloat(val)
    if (!isNaN(numVal)) {
      const clampedVal = Math.min(Math.max(numVal, min), max)
      onChange(clampedVal)
      if (clampedVal !== numVal) {
        setInputValue(clampedVal.toString())
      }
    }
  }

  const handleInputBlur = () => {
    setInputValue(value.toString())
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <div className="flex items-center gap-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 h-7 px-2 text-xs font-mono text-right bg-muted border-border"
          />
          {unit && <span className="text-xs text-muted-foreground font-mono">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}