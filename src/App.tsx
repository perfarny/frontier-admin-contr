import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Label } from './components/ui/label'
import { Input } from './components/ui/input'
import { Switch } from './components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Slider } from './components/ui/slider'
import { Gear, Lightning, Shield, Database, Network } from '@phosphor-icons/react'

interface AdminSettings {
  systemEnabled: boolean
  maintenanceMode: boolean
  debugLevel: string
  maxConnections: number
  cacheSize: number
  timeout: number
  encryption: boolean
  backupInterval: string
  logRetention: number
}

const defaultSettings: AdminSettings = {
  systemEnabled: true,
  maintenanceMode: false,
  debugLevel: 'info',
  maxConnections: 1000,
  cacheSize: 512,
  timeout: 30,
  encryption: true,
  backupInterval: '6h',
  logRetention: 7
}

function App() {
  const [settings, setSettings] = useKV<AdminSettings>('frontier-admin-settings', defaultSettings)
  const [isOpen, setIsOpen] = useState(false)

  const currentSettings = settings || defaultSettings

  const updateSetting = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings(current => ({ ...defaultSettings, ...current, [key]: value }))
  }

  const handleReset = () => {
    setSettings(defaultSettings)
  }

  const handleApply = () => {
    setIsOpen(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Frontier System</h1>
          <p className="text-muted-foreground">Advanced Control Interface</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Gear size={20} />
              Open Admin Control
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Shield size={24} />
                Frontier Admin Control
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* System Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightning size={16} />
                  System Status
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-enabled" className="text-sm">System Enabled</Label>
                    <Switch 
                      id="system-enabled"
                      checked={currentSettings.systemEnabled}
                      onCheckedChange={(checked) => updateSetting('systemEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-mode" className="text-sm">Maintenance Mode</Label>
                    <Switch 
                      id="maintenance-mode"
                      checked={currentSettings.maintenanceMode}
                      onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Database size={16} />
                  Configuration
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debug-level" className="text-sm">Debug Level</Label>
                    <Select value={currentSettings.debugLevel} onValueChange={(value) => updateSetting('debugLevel', value)}>
                      <SelectTrigger id="debug-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="trace">Trace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-interval" className="text-sm">Backup Interval</Label>
                    <Select value={currentSettings.backupInterval} onValueChange={(value) => updateSetting('backupInterval', value)}>
                      <SelectTrigger id="backup-interval">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="6h">6 Hours</SelectItem>
                        <SelectItem value="12h">12 Hours</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Performance Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Network size={16} />
                  Performance
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Max Connections</Label>
                      <span className="text-sm font-mono text-muted-foreground">{currentSettings.maxConnections}</span>
                    </div>
                    <Slider
                      value={[currentSettings.maxConnections]}
                      onValueChange={([value]) => updateSetting('maxConnections', value)}
                      max={5000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Cache Size (MB)</Label>
                      <span className="text-sm font-mono text-muted-foreground">{currentSettings.cacheSize}</span>
                    </div>
                    <Slider
                      value={[currentSettings.cacheSize]}
                      onValueChange={([value]) => updateSetting('cacheSize', value)}
                      max={2048}
                      min={128}
                      step={64}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Timeout (seconds)</Label>
                      <span className="text-sm font-mono text-muted-foreground">{currentSettings.timeout}</span>
                    </div>
                    <Slider
                      value={[currentSettings.timeout]}
                      onValueChange={([value]) => updateSetting('timeout', value)}
                      max={300}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield size={16} />
                  Security
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="encryption" className="text-sm">End-to-End Encryption</Label>
                    <Switch 
                      id="encryption"
                      checked={currentSettings.encryption}
                      onCheckedChange={(checked) => updateSetting('encryption', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Log Retention (days)</Label>
                      <span className="text-sm font-mono text-muted-foreground">{currentSettings.logRetention}</span>
                    </div>
                    <Slider
                      value={[currentSettings.logRetention]}
                      onValueChange={([value]) => updateSetting('logRetention', value)}
                      max={90}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleReset}>
                  Reset to Defaults
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApply}>
                    Apply Changes
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Display */}
        <div className="bg-card border rounded-lg p-4 max-w-md mx-auto">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={currentSettings.systemEnabled ? "text-green-400" : "text-orange-400"}>
                {currentSettings.systemEnabled ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode:</span>
              <span className={currentSettings.maintenanceMode ? "text-orange-400" : "text-green-400"}>
                {currentSettings.maintenanceMode ? "Maintenance" : "Active"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connections:</span>
              <span className="font-mono">{currentSettings.maxConnections}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App