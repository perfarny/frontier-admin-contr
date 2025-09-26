import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ControlSection } from './components/ControlSection'
import { ControlSlider } from './components/ControlSlider'
import { PresetManager } from './components/PresetManager'
import { Button } from './components/ui/button'
import { Switch } from './components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Label } from './components/ui/label'
import { Card } from './components/ui/card'
import { toast, Toaster } from 'sonner'

interface ControlState {
  // Audio Controls
  volume: number
  pitch: number
  reverb: number
  delay: number
  distortion: number
  
  // Visual Controls
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
  
  // Motion Controls
  speed: number
  acceleration: number
  damping: number
  frequency: number
  amplitude: number
  
  // System Controls
  enabled: boolean
  mode: string
  quality: string
}

interface Preset {
  id: string
  name: string
  data: ControlState
}

const defaultState: ControlState = {
  // Audio Controls
  volume: 0.8,
  pitch: 1.0,
  reverb: 0.3,
  delay: 0.2,
  distortion: 0.0,
  
  // Visual Controls
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
  hue: 0.0,
  blur: 0.0,
  
  // Motion Controls
  speed: 5.0,
  acceleration: 2.0,
  damping: 0.8,
  frequency: 1.0,
  amplitude: 0.5,
  
  // System Controls
  enabled: true,
  mode: 'normal',
  quality: 'high'
}

function App() {
  const [controls, setControls] = useKV<ControlState>('frontier-controls', defaultState)
  const [presets, setPresets] = useKV<Preset[]>('frontier-presets', [])
  const [openSections, setOpenSections] = useKV<Record<string, boolean>>('frontier-sections', {
    audio: true,
    visual: false,
    motion: false,
    system: false
  })

  const currentControls = controls || defaultState
  const currentPresets = presets || []
  const currentSections = openSections || { audio: true, visual: false, motion: false, system: false }

  const updateControl = <K extends keyof ControlState>(key: K, value: ControlState[K]) => {
    setControls(current => ({ ...defaultState, ...current, [key]: value }))
  }

  const toggleSection = (section: string) => {
    setOpenSections(current => ({ 
      audio: true, 
      visual: false, 
      motion: false, 
      system: false, 
      ...current, 
      [section]: !current?.[section] 
    }))
  }

  const handleSavePreset = (name: string, data: ControlState) => {
    const newPreset: Preset = {
      id: Date.now().toString(),
      name,
      data
    }
    setPresets(current => [...(current || []), newPreset])
    toast.success(`Preset "${name}" saved`)
  }

  const handleLoadPreset = (data: ControlState) => {
    setControls(data)
    toast.success('Preset loaded')
  }

  const handleDeletePreset = (id: string) => {
    const preset = currentPresets.find(p => p.id === id)
    setPresets(current => (current || []).filter(p => p.id !== id))
    toast.success(`Preset "${preset?.name}" deleted`)
  }

  const resetToDefaults = () => {
    setControls(defaultState)
    toast.success('Reset to defaults')
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Toaster position="top-right" />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Frontier Control Interface</h1>
          <p className="text-muted-foreground">
            Advanced parameter control system with real-time adjustment capabilities
          </p>
        </div>

        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={currentControls.enabled} 
                    onCheckedChange={(checked) => updateControl('enabled', checked)}
                  />
                  <Label>System Enabled</Label>
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  Status: {currentControls.enabled ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PresetManager
                  presets={currentPresets}
                  currentData={currentControls}
                  onSave={handleSavePreset}
                  onLoad={handleLoadPreset}
                  onDelete={handleDeletePreset}
                />
                <Button variant="outline" onClick={resetToDefaults}>
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <ControlSection
            title="Audio Controls"
            isOpen={currentSections.audio}
            onToggle={() => toggleSection('audio')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ControlSlider
                label="Volume"
                value={currentControls.volume}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateControl('volume', value)}
              />
              <ControlSlider
                label="Pitch"
                value={currentControls.pitch}
                min={0.5}
                max={2}
                step={0.01}
                onChange={(value) => updateControl('pitch', value)}
              />
              <ControlSlider
                label="Reverb"
                value={currentControls.reverb}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateControl('reverb', value)}
              />
              <ControlSlider
                label="Delay"
                value={currentControls.delay}
                min={0}
                max={1}
                step={0.01}
                unit="s"
                onChange={(value) => updateControl('delay', value)}
              />
              <ControlSlider
                label="Distortion"
                value={currentControls.distortion}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateControl('distortion', value)}
              />
            </div>
          </ControlSection>

          <ControlSection
            title="Visual Controls"
            isOpen={currentSections.visual}
            onToggle={() => toggleSection('visual')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ControlSlider
                label="Brightness"
                value={currentControls.brightness}
                min={0}
                max={2}
                step={0.01}
                onChange={(value) => updateControl('brightness', value)}
              />
              <ControlSlider
                label="Contrast"
                value={currentControls.contrast}
                min={0}
                max={2}
                step={0.01}
                onChange={(value) => updateControl('contrast', value)}
              />
              <ControlSlider
                label="Saturation"  
                value={currentControls.saturation}
                min={0}
                max={2}
                step={0.01}
                onChange={(value) => updateControl('saturation', value)}
              />
              <ControlSlider
                label="Hue Shift"
                value={currentControls.hue}
                min={-180}
                max={180}
                step={1}
                unit="°"
                onChange={(value) => updateControl('hue', value)}
              />
              <ControlSlider
                label="Blur"
                value={currentControls.blur}
                min={0}
                max={10}
                step={0.1}
                unit="px"
                onChange={(value) => updateControl('blur', value)}
              />
            </div>
          </ControlSection>

          <ControlSection
            title="Motion Controls"
            isOpen={currentSections.motion}
            onToggle={() => toggleSection('motion')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ControlSlider
                label="Speed"
                value={currentControls.speed}
                min={0}
                max={10}
                step={0.1}
                onChange={(value) => updateControl('speed', value)}
              />
              <ControlSlider
                label="Acceleration"
                value={currentControls.acceleration}
                min={0}
                max={5}
                step={0.1}
                onChange={(value) => updateControl('acceleration', value)}
              />
              <ControlSlider
                label="Damping"
                value={currentControls.damping}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateControl('damping', value)}
              />
              <ControlSlider
                label="Frequency"
                value={currentControls.frequency}
                min={0.1}
                max={5}
                step={0.1}
                unit="Hz"
                onChange={(value) => updateControl('frequency', value)}
              />
              <ControlSlider
                label="Amplitude"
                value={currentControls.amplitude}
                min={0}
                max={2}
                step={0.01}
                onChange={(value) => updateControl('amplitude', value)}
              />
            </div>
          </ControlSection>

          <ControlSection
            title="System Controls"
            isOpen={currentSections.system}
            onToggle={() => toggleSection('system')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Processing Mode</Label>
                <Select value={currentControls.mode} onValueChange={(value) => updateControl('mode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quality Setting</Label>
                <Select value={currentControls.quality} onValueChange={(value) => updateControl('quality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ControlSection>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium mb-2">Current Configuration</h3>
          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
            {JSON.stringify(currentControls, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App