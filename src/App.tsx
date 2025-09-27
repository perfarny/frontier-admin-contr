import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group'
import { Label } from './components/ui/label'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { Checkbox } from './components/ui/checkbox'
import { X } from '@phosphor-icons/react'

// Types
type AccessLevel = 'no-access' | 'all-users' | 'specific-groups'
type VersionType = 'unified' | 'separated' | 'enhanced'

interface Settings {
  webApps: AccessLevel
  webGroups: string[]
  officeWin32: AccessLevel
  officeGroups: string[]
  allApps: AccessLevel
  allAppsGroups: string[]
  enablePerDeviceAccess: boolean
  perDeviceAccessType: 'all-users' | 'specific-groups'
  perDeviceGroups: string[]
}

// Default settings for different versions
const getDefaultSettings = (version: VersionType): Settings => {
  switch (version) {
    case 'unified': // A. No Toggle
      return {
        webApps: 'no-access',
        webGroups: [],
        officeWin32: 'no-access',
        officeGroups: [],
        allApps: 'no-access',
        allAppsGroups: [],
        enablePerDeviceAccess: true,
        perDeviceAccessType: 'all-users',
        perDeviceGroups: []
      }
    case 'separated': // B. Toggle - 3 Tabs
      return {
        webApps: 'no-access',
        webGroups: [],
        officeWin32: 'all-users',
        officeGroups: [],
        allApps: 'all-users',
        allAppsGroups: [],
        enablePerDeviceAccess: true,
        perDeviceAccessType: 'all-users',
        perDeviceGroups: []
      }
    case 'enhanced': // C. Toggle - 2 Tabs
      return {
        webApps: 'no-access',
        webGroups: [],
        officeWin32: 'all-users',
        officeGroups: [],
        allApps: 'no-access',
        allAppsGroups: [],
        enablePerDeviceAccess: true,
        perDeviceAccessType: 'all-users',
        perDeviceGroups: []
      }
  }
}

const defaultSettings: Settings = {
  webApps: 'no-access',
  webGroups: [],
  officeWin32: 'all-users',
  officeGroups: [],
  allApps: 'no-access',
  allAppsGroups: [],
  enablePerDeviceAccess: true,
  perDeviceAccessType: 'all-users',
  perDeviceGroups: []
}

// Group management component
interface GroupManagerProps {
  groups: string[]
  onAddGroup: (group: string) => void
  onRemoveGroup: (index: number) => void
  placeholder?: string
  inputId: string
}

function GroupManager({ groups, onAddGroup, onRemoveGroup, placeholder = "Enter group name", inputId }: GroupManagerProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !groups.includes(trimmed)) {
      onAddGroup(trimmed)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          id={inputId}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleAdd} variant="outline" size="sm" className="border-black">
          Add
        </Button>
      </div>
      
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {groups.map((group, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {group}
              <button
                onClick={() => onRemoveGroup(index)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Access control component
interface AccessControlProps {
  value: AccessLevel
  onChange: (value: AccessLevel) => void
  groups: string[]
  onAddGroup: (group: string) => void
  onRemoveGroup: (index: number) => void
  prefix: string
  labels: {
    noAccess: string
    allUsers: string
    specificGroups: string
  }
  descriptions: {
    noAccess: string
    allUsers: string
    specificGroups: string
  }
}

function AccessControl({
  value,
  onChange,
  groups,
  onAddGroup,
  onRemoveGroup,
  prefix,
  labels,
  descriptions
}: AccessControlProps) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as AccessLevel)} className="space-y-3">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no-access" id={`${prefix}-no-access`} className="border-black" />
        <Label htmlFor={`${prefix}-no-access`} className="font-normal" data-editable="true">
          {labels.noAccess}
        </Label>
      </div>
      <div className="text-xs text-muted-foreground ml-6 -mt-2" data-editable="true">
        {descriptions.noAccess}
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all-users" id={`${prefix}-all-users`} className="border-black" />
        <Label htmlFor={`${prefix}-all-users`} className="font-normal" data-editable="true">
          {labels.allUsers}
        </Label>
      </div>
      <div className="text-xs text-muted-foreground ml-6 -mt-2" data-editable="true">
        {descriptions.allUsers}
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="specific-groups" id={`${prefix}-specific-groups`} className="border-black" />
        <Label htmlFor={`${prefix}-specific-groups`} className="font-normal" data-editable="true">
          {labels.specificGroups}
        </Label>
      </div>
      <div className="text-xs text-muted-foreground ml-6 -mt-2" data-editable="true">
        {descriptions.specificGroups}
      </div>
      {value === 'specific-groups' && (
        <div className="ml-6">
          <GroupManager
            groups={groups}
            onAddGroup={onAddGroup}
            onRemoveGroup={onRemoveGroup}
            inputId={`${prefix}-group-input`}
          />
        </div>
      )}
    </RadioGroup>
  );
}

// Version A: Unified Apps Interface
function UnifiedVersion({ settings, updateSettings }: { settings: Settings; updateSettings: (updates: Partial<Settings>) => void }) {
  const [activeTab, setActiveTab] = useState('apps')

  return (
    <Card className="w-[672px] h-[780px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold" data-editable="true">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p data-editable="true">The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p data-editable="true">To get the most out of the Frontier program, we recommend turning it on for web apps, desktop apps, and agents.</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="apps" className="cursor-pointer">Apps</TabsTrigger>
              <TabsTrigger value="agents" className="cursor-pointer">Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2" data-editable="true">Apps</h3>
                <p className="text-sm text-muted-foreground mb-4" data-editable="true">Select which users automatically get Frontier features in their M365 applications.</p>
              </div>

              <AccessControl
                value={settings.allApps}
                onChange={(value) => updateSettings({ allApps: value, allAppsGroups: value !== 'specific-groups' ? [] : settings.allAppsGroups })}
                groups={settings.allAppsGroups}
                onAddGroup={(group) => updateSettings({ allAppsGroups: [...settings.allAppsGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ allAppsGroups: settings.allAppsGroups.filter((_, i) => i !== index) })}
                prefix="unified-apps"
                labels={{
                  noAccess: 'No access',
                  allUsers: 'All users',
                  specificGroups: 'Specific user groups'
                }}
                descriptions={{
                  noAccess: 'Users will not have access to Frontier features.',
                  allUsers: 'All users will automatically receive Frontier features.',
                  specificGroups: 'Only specified user groups will automatically receive Frontier features.'
                }}
              />
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2" data-editable="true">Get early access to AI agents built by Microsoft</h3>
                <p className="text-sm text-muted-foreground" data-editable="true">
                  The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

// Version B: Separated Apps Interface
function SeparatedVersion({ settings, updateSettings }: { settings: Settings; updateSettings: (updates: Partial<Settings>) => void }) {
  const [activeTab, setActiveTab] = useState('web-apps')

  return (
    <Card className="w-[672px] h-[780px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold" data-editable="true">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p data-editable="true">The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p data-editable="true">To get the most out of the Frontier program, we recommend turning it on for web apps, desktop apps, and agents.</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="web-apps" className="cursor-pointer" data-editable="true">Web apps</TabsTrigger>
              <TabsTrigger value="office" className="cursor-pointer" data-editable="true">Office Desktop Apps</TabsTrigger>
              <TabsTrigger value="agents" className="cursor-pointer" data-editable="true">Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="web-apps" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2" data-editable="true">Enable Frontier features in web apps</h3>
                <p className="text-sm text-muted-foreground mb-4" data-editable="true">Select which users automatically get Frontier features in web apps.</p>
              </div>

              <AccessControl
                value={settings.webApps}
                onChange={(value) => updateSettings({ webApps: value, webGroups: value !== 'specific-groups' ? [] : settings.webGroups })}
                groups={settings.webGroups}
                onAddGroup={(group) => updateSettings({ webGroups: [...settings.webGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ webGroups: settings.webGroups.filter((_, i) => i !== index) })}
                prefix="separated-web"
                labels={{
                  noAccess: 'No access',
                  allUsers: 'All users',
                  specificGroups: 'Specific user groups'
                }}
                descriptions={{
                  noAccess: 'Users will not have access to Frontier features in web apps.',
                  allUsers: 'All users in your organization will automatically receive Frontier features in web apps.',
                  specificGroups: 'Only specified user groups will automatically receive Frontier features in web apps.'
                }}
              />
            </TabsContent>

            <TabsContent value="office" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2" data-editable="true">Allow users to enable Frontier features in Office Desktop applications</h3>
                <p className="text-sm text-muted-foreground mb-4" data-editable="true">By default, Frontier features are turned off in Office desktop applications, but all users can choose to turn them on. User choices are device specific.</p>
              </div>

              <AccessControl
                value={settings.officeWin32}
                onChange={(value) => updateSettings({ officeWin32: value, officeGroups: value !== 'specific-groups' ? [] : settings.officeGroups })}
                groups={settings.officeGroups}
                onAddGroup={(group) => updateSettings({ officeGroups: [...settings.officeGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ officeGroups: settings.officeGroups.filter((_, i) => i !== index) })}
                prefix="separated-office"
                labels={{
                  noAccess: 'No access',
                  allUsers: 'All users',
                  specificGroups: 'Specific user groups'
                }}
                descriptions={{
                  noAccess: 'Users cannot choose to enable Frontier features.',
                  allUsers: 'All users can choose to enable Frontier features.',
                  specificGroups: 'Only specified user can choose to enable Frontier features.'
                }}
              />
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2" data-editable="true">Get early access to AI agents built by Microsoft</h3>
                <p className="text-sm text-muted-foreground" data-editable="true">The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

// Version C: Enhanced with Per-Device Controls
function EnhancedVersion({ settings, updateSettings }: { settings: Settings; updateSettings: (updates: Partial<Settings>) => void }) {
  const [activeTab, setActiveTab] = useState('apps')

  return (
    <Card className="max-w-2xl w-full h-[950px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold" data-editable="true">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p data-editable="true">The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p data-editable="true">To get the most out of the Frontier program, we recommend turning it on for web apps, desktop apps, and agents.</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="apps" className="cursor-pointer">Apps</TabsTrigger>
              <TabsTrigger value="agents" className="cursor-pointer">Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2" data-editable="true">Apps</h3>
                <p className="text-sm text-muted-foreground mb-4" data-editable="true">Select which users automatically get Frontier features in applications.</p>
              </div>

              <AccessControl
                value={settings.allApps}
                onChange={(value) => updateSettings({ allApps: value, allAppsGroups: value !== 'specific-groups' ? [] : settings.allAppsGroups })}
                groups={settings.allAppsGroups}
                onAddGroup={(group) => updateSettings({ allAppsGroups: [...settings.allAppsGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ allAppsGroups: settings.allAppsGroups.filter((_, i) => i !== index) })}
                prefix="enhanced-apps"
                labels={{
                  noAccess: 'No access',
                  allUsers: 'All users',
                  specificGroups: 'Specific user groups'
                }}
                descriptions={{
                  noAccess: 'Users will not have access to Frontier features in web apps.',
                  allUsers: 'All users in your organization will automatically receive Frontier features in web apps.',
                  specificGroups: 'Only specified user groups will automatically receive Frontier features in web apps.'
                }}
              />

              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enhanced-per-device-access"
                    checked={settings.enablePerDeviceAccess}
                    onCheckedChange={(checked) => updateSettings({ enablePerDeviceAccess: !!checked })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="enhanced-per-device-access" className="font-medium cursor-pointer text-base leading-tight" data-editable="true">
                    Allow per device enrollment in Office desktop applications
                  </Label>
                </div>
                <div className="text-muted-foreground ml-6 mt-1 text-sm" data-editable="true">
                  By default, Frontier features are turned off in Office desktop applications, but all users can choose to turn them on. User choices are device specific.
                </div>

                <div className={`ml-6 mt-3 space-y-1 ${!settings.enablePerDeviceAccess ? 'opacity-50 pointer-events-none' : ''}`}>
                  <RadioGroup
                    value={settings.enablePerDeviceAccess ? settings.perDeviceAccessType : ''}
                    onValueChange={(value) => updateSettings({ perDeviceAccessType: value as 'all-users' | 'specific-groups', perDeviceGroups: value !== 'specific-groups' ? [] : settings.perDeviceGroups })}
                    className="space-y-0.5"
                    disabled={!settings.enablePerDeviceAccess}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all-users" id="enhanced-per-device-all-users" className="border-black" />
                      <Label htmlFor="enhanced-per-device-all-users" className="font-normal" data-editable="true">All users</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific-groups" id="enhanced-per-device-specific-groups" className="border-black" />
                      <Label htmlFor="enhanced-per-device-specific-groups" className="font-normal" data-editable="true">Specific user groups</Label>
                    </div>

                    {settings.perDeviceAccessType === 'specific-groups' && settings.enablePerDeviceAccess && (
                      <div className="ml-6 mt-2">
                        <GroupManager
                          groups={settings.perDeviceGroups}
                          onAddGroup={(group) => updateSettings({ perDeviceGroups: [...settings.perDeviceGroups, group] })}
                          onRemoveGroup={(index) => updateSettings({ perDeviceGroups: settings.perDeviceGroups.filter((_, i) => i !== index) })}
                          inputId="enhanced-per-device-group-input"
                        />
                      </div>
                    )}
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2" data-editable="true">Get early access to AI agents built by Microsoft</h3>
                <p className="text-sm text-muted-foreground" data-editable="true">
                  The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

// Main App component
export default function App() {
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('unified')
  const [settings, setSettings] = useKV<Settings>(`frontier-settings-v4-${selectedVersion}`, getDefaultSettings(selectedVersion))
  const [publishedSettings, setPublishedSettings] = useKV<Settings>(`published-frontier-settings-v4-${selectedVersion}`, getDefaultSettings(selectedVersion))

  const currentSettings = { ...getDefaultSettings(selectedVersion), ...settings }
  const currentPublishedSettings = { ...getDefaultSettings(selectedVersion), ...publishedSettings }
  
  // Use a more robust comparison that handles initial state properly
  const hasUnpublishedChanges = () => {
    // If both are effectively defaults, no changes
    if (!settings && !publishedSettings) return false
    
    // If one exists and the other doesn't, there are changes
    if (!!settings !== !!publishedSettings) return true
    
    // Compare the actual merged objects
    return JSON.stringify(currentSettings) !== JSON.stringify(currentPublishedSettings)
  }

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(current => ({ ...getDefaultSettings(selectedVersion), ...current, ...updates }))
  }

  const resetToDefaults = () => setSettings(getDefaultSettings(selectedVersion))
  const publishChanges = () => setPublishedSettings(currentSettings)

  // Handle version switching - reset to version-specific defaults
  const handleVersionChange = (version: VersionType) => {
    setSelectedVersion(version)
    // Reset settings when switching versions to use version-specific defaults
    setSettings(getDefaultSettings(version))
    setPublishedSettings(getDefaultSettings(version))
  }

  const versions = {
    unified: () => <UnifiedVersion settings={currentSettings} updateSettings={updateSettings} />,
    separated: () => <SeparatedVersion settings={currentSettings} updateSettings={updateSettings} />,
    enhanced: () => <EnhancedVersion settings={currentSettings} updateSettings={updateSettings} />
  }

  const SelectedVersion = versions[selectedVersion]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <div className="flex items-center gap-4 p-6 bg-card rounded-lg border shadow-lg">
        <span className="text-lg font-semibold text-foreground" data-editable="true">Select Version:</span>
        <div className="flex gap-2">
          <Button
            variant={selectedVersion === 'unified' ? "default" : "outline"}
            onClick={() => handleVersionChange('unified')}
            className="border-black"
            data-editable="true"
          >A. No Toggle</Button>
          <Button
            variant={selectedVersion === 'separated' ? "default" : "outline"}
            onClick={() => handleVersionChange('separated')}
            className="border-black"
            data-editable="true"
          >B. Toggle - 3 Tabs</Button>
          <Button
            variant={selectedVersion === 'enhanced' ? "default" : "outline"}
            onClick={() => handleVersionChange('enhanced')}
            className="border-black"
            data-editable="true"
          >C. Toggle - 2 Tabs</Button>
        </div>
      </div>
      <div className="relative">
        <SelectedVersion />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button variant="outline" onClick={resetToDefaults} className="border-black" data-editable="true">Cancel</Button>
          <Button onClick={publishChanges} disabled={!hasUnpublishedChanges()} className="border-black" data-editable="true">Save</Button>
        </div>
      </div>
    </div>
  );
}