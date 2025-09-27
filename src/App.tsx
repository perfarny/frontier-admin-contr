import { useState, useCallback } from 'react'
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

// Core types
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

// Reusable components
interface GroupInputProps {
  value: string
  onChange: (value: string) => void
  onAdd: () => void
  placeholder?: string
  id: string
}

const GroupInput = ({ value, onChange, onAdd, placeholder = "Enter group name", id }: GroupInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAdd()
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button onClick={onAdd} variant="outline" size="sm">
        Add
      </Button>
    </div>
  )
}

interface GroupListProps {
  groups: string[]
  onRemove: (index: number) => void
}

const GroupList = ({ groups, onRemove }: GroupListProps) => {
  if (!groups.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((group, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          {group}
          <button
            onClick={() => onRemove(index)}
            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
    </div>
  )
}

interface AccessControlProps {
  value: AccessLevel
  onChange: (value: AccessLevel) => void
  groups: string[]
  onAddGroup: () => void
  onRemoveGroup: (index: number) => void
  groupInput: string
  onGroupInputChange: (value: string) => void
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

const AccessControl = ({
  value,
  onChange,
  groups,
  onAddGroup,
  onRemoveGroup,
  groupInput,
  onGroupInputChange,
  prefix,
  labels,
  descriptions
}: AccessControlProps) => (
  <RadioGroup value={value} onValueChange={(v) => onChange(v as AccessLevel)} className="space-y-3">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="no-access" id={`${prefix}-no-access`} className="border-black" />
      <Label htmlFor={`${prefix}-no-access`} className="font-normal">
        {labels.noAccess}
      </Label>
    </div>
    <div className="text-xs text-muted-foreground ml-6 -mt-2">
      {descriptions.noAccess}
    </div>

    <div className="flex items-center space-x-2">
      <RadioGroupItem value="all-users" id={`${prefix}-all-users`} className="border-black" />
      <Label htmlFor={`${prefix}-all-users`} className="font-normal">
        {labels.allUsers}
      </Label>
    </div>
    <div className="text-xs text-muted-foreground ml-6 -mt-2">
      {descriptions.allUsers}
    </div>

    <div className="flex items-center space-x-2">
      <RadioGroupItem value="specific-groups" id={`${prefix}-specific-groups`} className="border-black" />
      <Label htmlFor={`${prefix}-specific-groups`} className="font-normal">
        {labels.specificGroups}
      </Label>
    </div>
    <div className="text-xs text-muted-foreground ml-6 -mt-2">
      {descriptions.specificGroups}
    </div>

    {value === 'specific-groups' && (
      <div className="ml-6 space-y-3">
        <GroupInput
          id={`${prefix}-group-input`}
          value={groupInput}
          onChange={onGroupInputChange}
          onAdd={onAddGroup}
        />
        <GroupList groups={groups} onRemove={onRemoveGroup} />
      </div>
    )}
  </RadioGroup>
)

function App() {
  const [settings, setSettings] = useKV<Settings>('frontier-settings-v2', defaultSettings)
  const [publishedSettings, setPublishedSettings] = useKV<Settings>('published-frontier-settings-v2', defaultSettings)
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('unified')
  
  // Input states for each context
  const [inputs, setInputs] = useState({
    webGroup: '',
    officeGroup: '',
    allAppsGroup: '',
    perDeviceGroup: ''
  })

  // Tab states
  const [tabs, setTabs] = useState({
    unified: 'apps',
    separated: 'web-apps',
    enhanced: 'apps'
  })

  const currentSettings = { ...defaultSettings, ...settings }
  const currentPublishedSettings = { ...defaultSettings, ...publishedSettings }
  const hasUnpublishedChanges = JSON.stringify(currentSettings) !== JSON.stringify(currentPublishedSettings)

  // Generic update function
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(current => ({ ...defaultSettings, ...current, ...updates }))
  }, [setSettings])

  // Generic group management
  const addGroup = useCallback((field: keyof Settings, inputField: keyof typeof inputs) => {
    const inputValue = inputs[inputField].trim()
    if (!inputValue) return

    const currentGroups = (currentSettings[field] as string[]) || []
    updateSettings({ [field]: [...currentGroups, inputValue] })
    setInputs(prev => ({ ...prev, [inputField]: '' }))
  }, [inputs, currentSettings, updateSettings])

  const removeGroup = useCallback((field: keyof Settings, index: number) => {
    const currentGroups = (currentSettings[field] as string[]) || []
    updateSettings({ [field]: currentGroups.filter((_, i) => i !== index) })
  }, [currentSettings, updateSettings])

  const updateInput = useCallback((field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetToDefaults = () => setSettings(defaultSettings)
  const publishChanges = () => setPublishedSettings(currentSettings)

  // Version A: Unified Apps Interface
  const UnifiedVersion = () => (
    <Card className="max-w-2xl w-full h-[780px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p>To get the most out of the Frontier program, we recommend turning it on for web apps, desktop apps, and agents.</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <Tabs value={tabs.unified} onValueChange={(v) => setTabs(prev => ({ ...prev, unified: v }))} className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="apps">Apps</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2">Apps</h3>
                <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in their M365 applications.</p>
              </div>

              <AccessControl
                value={currentSettings.allApps}
                onChange={(value) => updateSettings({ allApps: value })}
                groups={currentSettings.allAppsGroups}
                onAddGroup={() => addGroup('allAppsGroups', 'allAppsGroup')}
                onRemoveGroup={(index) => removeGroup('allAppsGroups', index)}
                groupInput={inputs.allAppsGroup}
                onGroupInputChange={(value) => updateInput('allAppsGroup', value)}
                prefix="unified-apps"
                labels={{
                  noAccess: 'No access',
                  allUsers: 'All users',
                  specificGroups: 'Specific user groups'
                }}
                descriptions={{
                  noAccess: 'Users will not have access to Frontier features.',
                  allUsers: 'All users in your organization will automatically receive Frontier features.',
                  specificGroups: 'Only specified user groups will automatically receive Frontier features.'
                }}
              />
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2">Get early access to AI agents built by Microsoft</h3>
                <p className="text-sm text-muted-foreground">
                  The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={resetToDefaults}>Cancel</Button>
          <Button onClick={publishChanges} disabled={!hasUnpublishedChanges}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )

  // Version B: Separated Apps Interface
  const SeparatedVersion = () => (
    <Card className="max-w-2xl w-full h-[780px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p>To get the most out of the Frontier program, we recommend turning it on for web apps, desktop apps, and agents.</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <Tabs value={tabs.separated} onValueChange={(v) => setTabs(prev => ({ ...prev, separated: v }))} className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="web-apps">Web apps</TabsTrigger>
              <TabsTrigger value="office">Office Desktop Apps</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="web-apps" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2">Enable Frontier features in web apps</h3>
                <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in web apps.</p>
              </div>

              <AccessControl
                value={currentSettings.webApps}
                onChange={(value) => updateSettings({ webApps: value })}
                groups={currentSettings.webGroups}
                onAddGroup={() => addGroup('webGroups', 'webGroup')}
                onRemoveGroup={(index) => removeGroup('webGroups', index)}
                groupInput={inputs.webGroup}
                onGroupInputChange={(value) => updateInput('webGroup', value)}
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
                <h3 className="font-medium mb-2">Allow users to enable Frontier features in Office Desktop applications</h3>
                <p className="text-sm text-muted-foreground mb-4">By default, Frontier features are turned off in Office desktop applications, but all users can choose to turn them on. Users choices are device specific.</p>
              </div>

              <AccessControl
                value={currentSettings.officeWin32}
                onChange={(value) => updateSettings({ officeWin32: value })}
                groups={currentSettings.officeGroups}
                onAddGroup={() => addGroup('officeGroups', 'officeGroup')}
                onRemoveGroup={(index) => removeGroup('officeGroups', index)}
                groupInput={inputs.officeGroup}
                onGroupInputChange={(value) => updateInput('officeGroup', value)}
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
                <h3 className="font-bold mb-2">Get early access to AI agents built by Microsoft</h3>
                <p className="text-sm text-muted-foreground">
                  The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={resetToDefaults}>Cancel</Button>
          <Button onClick={publishChanges} disabled={!hasUnpublishedChanges}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )

  // Version C: Enhanced with Per-Device Controls
  const EnhancedVersion = () => (
    <Card className="max-w-2xl w-full h-[950px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p>To get the most out of the Frontier program, we recommend turning it on for web apps, desktop apps, and agents.</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <Tabs value={tabs.enhanced} onValueChange={(v) => setTabs(prev => ({ ...prev, enhanced: v }))} className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="apps">Apps</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2">Apps</h3>
                <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in applications.</p>
              </div>

              <AccessControl
                value={currentSettings.allApps}
                onChange={(value) => updateSettings({ allApps: value })}
                groups={currentSettings.allAppsGroups}
                onAddGroup={() => addGroup('allAppsGroups', 'allAppsGroup')}
                onRemoveGroup={(index) => removeGroup('allAppsGroups', index)}
                groupInput={inputs.allAppsGroup}
                onGroupInputChange={(value) => updateInput('allAppsGroup', value)}
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
                    checked={currentSettings.enablePerDeviceAccess}
                    onCheckedChange={(checked) => updateSettings({ enablePerDeviceAccess: !!checked })}
                    className="border-black mt-0.5"
                  />
                  <Label htmlFor="enhanced-per-device-access" className="font-medium cursor-pointer text-base leading-tight">
                    Allow per device enrollment in Office desktop applications
                  </Label>
                </div>
                <div className="text-muted-foreground ml-6 mt-1 text-sm">
                  By default, Frontier features are turned off in Office desktop applications, but all users can choose to turn them on. User choices are device specific.
                </div>

                <div className={`ml-6 mt-3 space-y-1 ${!currentSettings.enablePerDeviceAccess ? 'opacity-50 pointer-events-none' : ''}`}>
                  <RadioGroup
                    value={currentSettings.enablePerDeviceAccess ? currentSettings.perDeviceAccessType : ''}
                    onValueChange={(value) => updateSettings({ perDeviceAccessType: value as 'all-users' | 'specific-groups' })}
                    className="space-y-0.5"
                    disabled={!currentSettings.enablePerDeviceAccess}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all-users" id="enhanced-per-device-all-users" className="border-black" />
                      <Label htmlFor="enhanced-per-device-all-users" className="font-normal">All users</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific-groups" id="enhanced-per-device-specific-groups" className="border-black" />
                      <Label htmlFor="enhanced-per-device-specific-groups" className="font-normal">Specific user groups</Label>
                    </div>

                    {currentSettings.perDeviceAccessType === 'specific-groups' && currentSettings.enablePerDeviceAccess && (
                      <div className="ml-6 space-y-2 mt-2">
                        <GroupInput
                          id="enhanced-per-device-group-input"
                          value={inputs.perDeviceGroup}
                          onChange={(value) => updateInput('perDeviceGroup', value)}
                          onAdd={() => addGroup('perDeviceGroups', 'perDeviceGroup')}
                        />
                        <GroupList
                          groups={currentSettings.perDeviceGroups}
                          onRemove={(index) => removeGroup('perDeviceGroups', index)}
                        />
                      </div>
                    )}
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2">Get early access to AI agents built by Microsoft</h3>
                <p className="text-sm text-muted-foreground">
                  The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={resetToDefaults}>Cancel</Button>
          <Button onClick={publishChanges} disabled={!hasUnpublishedChanges}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )

  const versions = {
    unified: UnifiedVersion,
    separated: SeparatedVersion,
    enhanced: EnhancedVersion
  }

  const SelectedVersion = versions[selectedVersion]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <div className="flex items-center gap-4 p-6 bg-card rounded-lg border shadow-lg">
        <span className="text-lg font-semibold text-foreground">Select Version:</span>
        <div className="flex gap-2">
          <Button
            variant={selectedVersion === 'unified' ? "default" : "outline"}
            onClick={() => setSelectedVersion('unified')}
            className="border-black cursor-pointer"
          >
            A. Unified Apps
          </Button>
          <Button
            variant={selectedVersion === 'separated' ? "default" : "outline"}
            onClick={() => setSelectedVersion('separated')}
            className="border-black cursor-pointer"
          >
            B. Separated Apps
          </Button>
          <Button
            variant={selectedVersion === 'enhanced' ? "default" : "outline"}
            onClick={() => setSelectedVersion('enhanced')}
            className="border-black cursor-pointer"
          >
            C. Enhanced Controls
          </Button>
        </div>
      </div>
      <SelectedVersion />
    </div>
  )
}

export default App