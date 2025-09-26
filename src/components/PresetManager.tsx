import { useState } from 'react'
import { FloppyDisk, FolderOpen, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Preset {
  id: string
  name: string
  data: Record<string, any>
}

interface PresetManagerProps {
  presets: Preset[]
  onSave: (name: string, data: Record<string, any>) => void
  onLoad: (data: Record<string, any>) => void
  onDelete: (id: string) => void
  currentData: Record<string, any>
}

export function PresetManager({ 
  presets, 
  onSave, 
  onLoad, 
  onDelete, 
  currentData 
}: PresetManagerProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName.trim(), currentData)
      setPresetName('')
      setSaveDialogOpen(false)
    }
  }

  const handleLoad = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      onLoad(preset.data)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPreset} onValueChange={(value) => {
        setSelectedPreset(value)
        handleLoad(value)
      }}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Load preset..." />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FloppyDisk className="h-4 w-4" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!presetName.trim()}>
                Save Preset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPreset && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            onDelete(selectedPreset)
            setSelectedPreset('')
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}