import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast, Toaster } from 'sonner'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group'
import { Label } from './components/ui/label'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'
import { Checkbox } from './components/ui/checkbox'
import { X, PencilSimple, Check } from '@phosphor-icons/react'

// Types
type AccessLevel = 'no-access' | 'all-users' | 'specific-groups'
type VersionType = 'unified' | 'separated' | 'enhanced' | 'enhanced-v1'

interface RadioButtonLabels {
  noAccess: string
  allUsers: string
  specificGroups: string
}

interface RadioButtonDescriptions {
  noAccess: string
  allUsers: string
  specificGroups: string
}

interface TabTextConfig {
  labels: RadioButtonLabels
  descriptions: RadioButtonDescriptions
}

interface AgentsTextConfig {
  title: string
  description: string
}

interface TextConfig {
  unified: {
    apps: TabTextConfig
    agents: AgentsTextConfig
  }
  separated: {
    office: TabTextConfig
    webApps: TabTextConfig
    agents: AgentsTextConfig
  }
  enhanced: {
    apps: TabTextConfig
    agents: AgentsTextConfig
  }
  'enhanced-v1': {
    apps: TabTextConfig
    office: TabTextConfig
    agents: AgentsTextConfig
  }
}

interface Settings {
  // Version A (unified) - uses allApps for its single Apps setting
  allApps: AccessLevel
  allAppsGroups: string[]
  
  // Version B (separated) - uses separate webApps and officeWin32
  webApps: AccessLevel
  webGroups: string[]
  officeWin32: AccessLevel
  officeGroups: string[]
  
  // Version C (enhanced) - uses allApps like Version A, plus per-device controls
  enablePerDeviceAccess: boolean
  perDeviceAccessType: 'all-users' | 'specific-groups'
  perDeviceGroups: string[]
  
  // Version C v1 (enhanced-v1) - uses allApps for both Apps and Office Apps sections
  officeAppsAccess: AccessLevel
  officeAppsGroups: string[]
}

// Static text configurations for each version - no dynamic generation
const STATIC_TEXT_CONFIGS: TextConfig = {
  unified: {
    apps: {
      labels: {
        noAccess: 'No access',
        allUsers: 'All users',
        specificGroups: 'Specific user groups'
      },
      descriptions: {
        noAccess: 'Users will not have access to Frontier features.',
        allUsers: 'All users will automatically receive Frontier features.',
        specificGroups: 'Only specified user groups will automatically receive Frontier features.'
      }
    },
    agents: {
      title: 'Get early access to AI agents built by Microsoft',
      description: 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.'
    }
  },
  separated: {
    office: {
      labels: {
        noAccess: 'No access',
        allUsers: 'All users',
        specificGroups: 'Specific user groups'
      },
      descriptions: {
        noAccess: 'Users cannot choose to enable Frontier features.',
        allUsers: 'All users can choose to enable Frontier features.',
        specificGroups: 'Only specified user groups can choose to enable Frontier features.'
      }
    },
    webApps: {
      labels: {
        noAccess: 'No access',
        allUsers: 'All users',
        specificGroups: 'Specific user groups'
      },
      descriptions: {
        noAccess: 'Users will not have access to Frontier features in web apps.',
        allUsers: 'All users will automatically receive Frontier features in web apps.',
        specificGroups: 'Only specified user groups will automatically receive Frontier features in web apps.'
      }
    },
    agents: {
      title: 'Get early access to AI agents built by Microsoft',
      description: 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.'
    }
  },
  enhanced: {
    apps: {
      labels: {
        noAccess: 'No access',
        allUsers: 'All users',
        specificGroups: 'Specific user groups'
      },
      descriptions: {
        noAccess: 'Users will not have access to Frontier features in their apps.',
        allUsers: 'All users will automatically receive Frontier features in their apps.',
        specificGroups: 'Only specified user groups will automatically receive Frontier features in their apps.'
      }
    },
    agents: {
      title: 'Get early access to AI agents built by Microsoft',
      description: 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.'
    }
  },
  'enhanced-v1': {
    apps: {
      labels: {
        noAccess: 'No access',
        allUsers: 'All users',
        specificGroups: 'Specific user groups'
      },
      descriptions: {
        noAccess: 'Users cannot choose to enable Frontier features in their Office apps.',
        allUsers: 'All users will automatically receive Frontier features in their Office apps.',
        specificGroups: 'Only specified user groups will automatically receive Frontier features in their Office apps.'
      }
    },
    office: {
      labels: {
        noAccess: 'No access',
        allUsers: 'All users',
        specificGroups: 'Specific user groups'
      },
      descriptions: {
        noAccess: 'Users will not have access to Frontier features in other apps.',
        allUsers: 'All users will automatically receive Frontier features in other apps.',
        specificGroups: 'Only specified user groups will automatically receive Frontier features in other apps.'
      }
    },
    agents: {
      title: 'Get early access to AI agents built by Microsoft',
      description: 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.'
    }
  }
}

// Development-only editable text component
interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  className?: string
  isDescription?: boolean
}

const isDevelopment = import.meta.env.DEV

function EditableText({ value, onChange, className = '', isDescription = false }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  // Don't allow editing in production
  if (!isDevelopment) {
    return <span className={className}>{value}</span>
  }

  const handleSave = () => {
    onChange(editValue.trim())
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {isDescription ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 resize-none border rounded px-2 py-1 text-xs ${className}`}
            rows={2}
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${className}`}
            autoFocus
          />
        )}
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
          <Check size={12} />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
          <X size={12} />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className={className}>{value}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <PencilSimple size={10} />
      </Button>
    </div>
  )
}

// Default settings for different versions
const getDefaultSettings = (version: VersionType): Settings => {
  switch (version) {
    case 'unified': // A. No Toggle
      return {
        // Version A uses allApps for its unified Apps setting
        allApps: 'no-access',
        allAppsGroups: [],
        // Version B settings (not used in Version A)
        webApps: 'no-access',
        webGroups: [],
        officeWin32: 'no-access',
        officeGroups: [],
        // Version C settings (not used in Version A)
        enablePerDeviceAccess: false,
        perDeviceAccessType: 'all-users',
        perDeviceGroups: [],
        // Version C v1 settings (not used in Version A)
        officeAppsAccess: 'no-access',
        officeAppsGroups: []
      }
    case 'separated': // B. Toggle - 3 Tabs
      return {
        // Version A settings (not used in Version B)
        allApps: 'no-access',
        allAppsGroups: [],
        // Version B uses separate webApps and officeWin32
        webApps: 'no-access',
        webGroups: [],
        officeWin32: 'all-users',
        officeGroups: [],
        // Version C settings (not used in Version B)
        enablePerDeviceAccess: true,
        perDeviceAccessType: 'all-users',
        perDeviceGroups: [],
        // Version C v1 settings (not used in Version B)
        officeAppsAccess: 'no-access',
        officeAppsGroups: []
      }
    case 'enhanced': // C. Toggle - 2 Tabs
      return {
        // Version C uses allApps like Version A
        allApps: 'no-access',
        allAppsGroups: [],
        // Version B settings (not used in Version C)
        webApps: 'no-access',
        webGroups: [],
        officeWin32: 'all-users',
        officeGroups: [],
        // Version C specific per-device controls
        enablePerDeviceAccess: true,
        perDeviceAccessType: 'all-users',
        perDeviceGroups: [],
        // Version C v1 settings (not used in Version C)
        officeAppsAccess: 'no-access',
        officeAppsGroups: []
      }
    case 'enhanced-v1': // C. Toggle - 2 Tabs v1
      return {
        // Version C v1 uses allApps for Apps section - set to 'all-users' by default
        allApps: 'all-users',
        allAppsGroups: [],
        // Version B settings (not used in Version C v1)
        webApps: 'no-access',
        webGroups: [],
        officeWin32: 'all-users',
        officeGroups: [],
        // Version C settings (not used in Version C v1)
        enablePerDeviceAccess: false,
        perDeviceAccessType: 'all-users',
        perDeviceGroups: [],
        // Version C v1 specific Office Apps controls - keep at 'no-access'
        officeAppsAccess: 'no-access',
        officeAppsGroups: []
      }
  }
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
  labels: RadioButtonLabels
  descriptions: RadioButtonDescriptions
  onUpdateLabels: (labels: RadioButtonLabels) => void
  onUpdateDescriptions: (descriptions: RadioButtonDescriptions) => void
}

function AccessControl({
  value,
  onChange,
  groups,
  onAddGroup,
  onRemoveGroup,
  prefix,
  labels,
  descriptions,
  onUpdateLabels,
  onUpdateDescriptions
}: AccessControlProps) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as AccessLevel)} className="space-y-3">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no-access" id={`${prefix}-no-access`} className="border-black" />
        <Label htmlFor={`${prefix}-no-access`} className="font-normal">
          <EditableText
            value={labels.noAccess}
            onChange={(newValue) => onUpdateLabels({ ...labels, noAccess: newValue })}
          />
        </Label>
      </div>
      <div className="text-xs text-muted-foreground ml-6 -mt-2">
        <EditableText
          value={descriptions.noAccess}
          onChange={(newValue) => onUpdateDescriptions({ ...descriptions, noAccess: newValue })}
          className="text-xs text-muted-foreground"
          isDescription={true}
        />
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all-users" id={`${prefix}-all-users`} className="border-black" />
        <Label htmlFor={`${prefix}-all-users`} className="font-normal">
          <EditableText
            value={labels.allUsers}
            onChange={(newValue) => onUpdateLabels({ ...labels, allUsers: newValue })}
          />
        </Label>
      </div>
      <div className="text-xs text-muted-foreground ml-6 -mt-2">
        <EditableText
          value={descriptions.allUsers}
          onChange={(newValue) => onUpdateDescriptions({ ...descriptions, allUsers: newValue })}
          className="text-xs text-muted-foreground"
          isDescription={true}
        />
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="specific-groups" id={`${prefix}-specific-groups`} className="border-black" />
        <Label htmlFor={`${prefix}-specific-groups`} className="font-normal">
          <EditableText
            value={labels.specificGroups}
            onChange={(newValue) => onUpdateLabels({ ...labels, specificGroups: newValue })}
          />
        </Label>
      </div>
      <div className="text-xs text-muted-foreground ml-6 -mt-2">
        <EditableText
          value={descriptions.specificGroups}
          onChange={(newValue) => onUpdateDescriptions({ ...descriptions, specificGroups: newValue })}
          className="text-xs text-muted-foreground"
          isDescription={true}
        />
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
function UnifiedVersion({ 
  settings, 
  updateSettings, 
  resetToDefaults, 
  hasChanges, 
  onSave, 
  textConfig, 
  updateTextConfig 
}: { 
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetToDefaults: () => void
  hasChanges: boolean
  onSave: () => void
  textConfig: TextConfig
  updateTextConfig: (updates: Partial<TextConfig>) => void
}) {
  const [activeTab, setActiveTab] = useState('apps')

  return (
    <Card className="w-[672px] h-[780px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p>To get the most out of the Frontier program, we recommend turning it on for both apps and agents.</p>
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
                <h3 className="font-medium mb-2">Apps</h3>
                <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in their M365 applications.</p>
              </div>

              <AccessControl
                value={settings.allApps}
                onChange={(value) => updateSettings({ allApps: value, allAppsGroups: value !== 'specific-groups' ? [] : settings.allAppsGroups })}
                groups={settings.allAppsGroups}
                onAddGroup={(group) => updateSettings({ allAppsGroups: [...settings.allAppsGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ allAppsGroups: settings.allAppsGroups.filter((_, i) => i !== index) })}
                prefix="unified-apps"
                labels={textConfig.unified.apps.labels}
                descriptions={textConfig.unified.apps.descriptions}
                onUpdateLabels={(labels) => updateTextConfig({
                  unified: {
                    ...textConfig.unified,
                    apps: { ...textConfig.unified.apps, labels }
                  }
                })}
                onUpdateDescriptions={(descriptions) => updateTextConfig({
                  unified: {
                    ...textConfig.unified,
                    apps: { ...textConfig.unified.apps, descriptions }
                  }
                })}
              />
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2">
                  <EditableText
                    value={textConfig.unified.agents.title}
                    onChange={(newValue) => updateTextConfig({
                      unified: {
                        ...textConfig.unified,
                        agents: { ...textConfig.unified.agents, title: newValue }
                      }
                    })}
                    className="font-bold"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  <EditableText
                    value={textConfig.unified.agents.description}
                    onChange={(newValue) => updateTextConfig({
                      unified: {
                        ...textConfig.unified,
                        agents: { ...textConfig.unified.agents, description: newValue }
                      }
                    })}
                    className="text-sm text-muted-foreground"
                    isDescription={true}
                  />
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="border-t pt-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults} 
            className="border-black"
            disabled={!hasChanges}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            variant={hasChanges ? "default" : "outline"}
            className={hasChanges ? "" : "border-black"}
            disabled={!hasChanges}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Version B: Separated Apps Interface
function SeparatedVersion({ 
  settings, 
  updateSettings, 
  resetToDefaults, 
  hasChanges, 
  onSave, 
  textConfig, 
  updateTextConfig 
}: { 
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetToDefaults: () => void
  hasChanges: boolean
  onSave: () => void
  textConfig: TextConfig
  updateTextConfig: (updates: Partial<TextConfig>) => void
}) {
  const [activeTab, setActiveTab] = useState('office')

  return (
    <Card className="w-[672px] h-[780px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p>To get the most out of the Frontier program, we recommend turning it on for all apps and agents.</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="office" className="cursor-pointer">Office Apps</TabsTrigger>
              <TabsTrigger value="web-apps" className="cursor-pointer">Other apps</TabsTrigger>
              <TabsTrigger value="agents" className="cursor-pointer">Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="office" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2">Allow users to enable Frontier features in Office applications like Word, Excel, PowerPoint</h3>
                <p className="text-sm text-muted-foreground mb-4">By default, Frontier features are turned off in Office applications, but all users can choose to turn them on. User choices are device specific.</p>
              </div>

              <AccessControl
                value={settings.officeWin32}
                onChange={(value) => updateSettings({ officeWin32: value, officeGroups: value !== 'specific-groups' ? [] : settings.officeGroups })}
                groups={settings.officeGroups}
                onAddGroup={(group) => updateSettings({ officeGroups: [...settings.officeGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ officeGroups: settings.officeGroups.filter((_, i) => i !== index) })}
                prefix="separated-office"
                labels={textConfig.separated.office.labels}
                descriptions={textConfig.separated.office.descriptions}
                onUpdateLabels={(labels) => updateTextConfig({
                  separated: {
                    ...textConfig.separated,
                    office: { ...textConfig.separated.office, labels }
                  }
                })}
                onUpdateDescriptions={(descriptions) => updateTextConfig({
                  separated: {
                    ...textConfig.separated,
                    office: { ...textConfig.separated.office, descriptions }
                  }
                })}
              />
            </TabsContent>

            <TabsContent value="web-apps" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-medium mb-2">Enable Frontier features in other apps</h3>
                <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in other apps.</p>
              </div>

              <AccessControl
                value={settings.webApps}
                onChange={(value) => updateSettings({ webApps: value, webGroups: value !== 'specific-groups' ? [] : settings.webGroups })}
                groups={settings.webGroups}
                onAddGroup={(group) => updateSettings({ webGroups: [...settings.webGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ webGroups: settings.webGroups.filter((_, i) => i !== index) })}
                prefix="separated-web"
                labels={textConfig.separated.webApps.labels}
                descriptions={textConfig.separated.webApps.descriptions}
                onUpdateLabels={(labels) => updateTextConfig({
                  separated: {
                    ...textConfig.separated,
                    webApps: { ...textConfig.separated.webApps, labels }
                  }
                })}
                onUpdateDescriptions={(descriptions) => updateTextConfig({
                  separated: {
                    ...textConfig.separated,
                    webApps: { ...textConfig.separated.webApps, descriptions }
                  }
                })}
              />
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2">
                  <EditableText
                    value={textConfig.separated.agents.title}
                    onChange={(newValue) => updateTextConfig({
                      separated: {
                        ...textConfig.separated,
                        agents: { ...textConfig.separated.agents, title: newValue }
                      }
                    })}
                    className="font-bold"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  <EditableText
                    value={textConfig.separated.agents.description}
                    onChange={(newValue) => updateTextConfig({
                      separated: {
                        ...textConfig.separated,
                        agents: { ...textConfig.separated.agents, description: newValue }
                      }
                    })}
                    className="text-sm text-muted-foreground"
                    isDescription={true}
                  />
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="border-t pt-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults} 
            className="border-black"
            disabled={!hasChanges}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            variant={hasChanges ? "default" : "outline"}
            className={hasChanges ? "" : "border-black"}
            disabled={!hasChanges}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Version C: Enhanced with Per-Device Controls
function EnhancedVersion({ 
  settings, 
  updateSettings, 
  resetToDefaults, 
  hasChanges, 
  onSave, 
  textConfig, 
  updateTextConfig 
}: { 
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetToDefaults: () => void
  hasChanges: boolean
  onSave: () => void
  textConfig: TextConfig
  updateTextConfig: (updates: Partial<TextConfig>) => void
}) {
  const [activeTab, setActiveTab] = useState('apps')

  return (
    <Card className="max-w-2xl w-full h-[950px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p>To get the most out of the Frontier program, we recommend turning it on for all apps and agents.</p>
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
                <h3 className="font-medium mb-2">Apps</h3>
                <p className="text-sm text-muted-foreground mb-4">Select which users automatically get Frontier features in applications.</p>
              </div>

              <AccessControl
                value={settings.allApps}
                onChange={(value) => updateSettings({ allApps: value, allAppsGroups: value !== 'specific-groups' ? [] : settings.allAppsGroups })}
                groups={settings.allAppsGroups}
                onAddGroup={(group) => updateSettings({ allAppsGroups: [...settings.allAppsGroups, group] })}
                onRemoveGroup={(index) => updateSettings({ allAppsGroups: settings.allAppsGroups.filter((_, i) => i !== index) })}
                prefix="enhanced-apps"
                labels={textConfig.enhanced.apps.labels}
                descriptions={textConfig.enhanced.apps.descriptions}
                onUpdateLabels={(labels) => updateTextConfig({
                  enhanced: {
                    ...textConfig.enhanced,
                    apps: { ...textConfig.enhanced.apps, labels }
                  }
                })}
                onUpdateDescriptions={(descriptions) => updateTextConfig({
                  enhanced: {
                    ...textConfig.enhanced,
                    apps: { ...textConfig.enhanced.apps, descriptions }
                  }
                })}
              />

              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enhanced-per-device-access"
                    checked={settings.enablePerDeviceAccess}
                    onCheckedChange={(checked) => updateSettings({ enablePerDeviceAccess: !!checked })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="enhanced-per-device-access" className="font-medium cursor-pointer text-base leading-tight">Allow user enrollment in Frontier</Label>
                </div>
                <div className="text-muted-foreground ml-6 mt-1 text-sm">By default, Frontier features are turned off in Office applications, but all users can choose to turn them on. User choices are device specific.</div>

                <div className={`ml-6 mt-3 space-y-1 ${!settings.enablePerDeviceAccess ? 'opacity-50 pointer-events-none' : ''}`}>
                  <RadioGroup
                    value={settings.enablePerDeviceAccess ? settings.perDeviceAccessType : ''}
                    onValueChange={(value) => updateSettings({ perDeviceAccessType: value as 'all-users' | 'specific-groups', perDeviceGroups: value !== 'specific-groups' ? [] : settings.perDeviceGroups })}
                    className="space-y-0.5"
                    disabled={!settings.enablePerDeviceAccess}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all-users" id="enhanced-per-device-all-users" className="border-black" />
                      <Label htmlFor="enhanced-per-device-all-users" className="font-normal">All users</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific-groups" id="enhanced-per-device-specific-groups" className="border-black" />
                      <Label htmlFor="enhanced-per-device-specific-groups" className="font-normal">Specific user groups</Label>
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
                <h3 className="font-bold mb-2">
                  <EditableText
                    value={textConfig.enhanced.agents.title}
                    onChange={(newValue) => updateTextConfig({
                      enhanced: {
                        ...textConfig.enhanced,
                        agents: { ...textConfig.enhanced.agents, title: newValue }
                      }
                    })}
                    className="font-bold"
                  />
                </h3>
                <p className="text-sm text-muted-foreground">
                  <EditableText
                    value={textConfig.enhanced.agents.description}
                    onChange={(newValue) => updateTextConfig({
                      enhanced: {
                        ...textConfig.enhanced,
                        agents: { ...textConfig.enhanced.agents, description: newValue }
                      }
                    })}
                    className="text-sm text-muted-foreground"
                    isDescription={true}
                  />
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="border-t pt-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults} 
            className="border-black"
            disabled={!hasChanges}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            variant={hasChanges ? "default" : "outline"}
            className={hasChanges ? "" : "border-black"}
            disabled={!hasChanges}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


// Version C v1: Enhanced with Duplicate Apps Interface
function EnhancedV1Version({ 
  settings, 
  updateSettings, 
  resetToDefaults, 
  hasChanges, 
  onSave, 
  textConfig, 
  updateTextConfig,
  sectionTitleApps = "Apps like Word, Excel, PowerPoint",
  sectionTitleOffice = "Other Apps",
  onUpdateSectionTitleApps,
  onUpdateSectionTitleOffice,
  sectionDescApps = "By default, Frontier features are turned off in Office applications, but all users can choose to turn them on",
  onUpdateSectionDescApps,
  sectionDescOffice = "Select which users automatically get Frontier features in other applications.",
  onUpdateSectionDescOffice,
  agentsTitle = "Get early access to AI agents built by Microsoft",
  onUpdateAgentsTitle,
  agentsDesc = "The Frontier program gives you early access to Microsoft's pre-built AI agents. Go to the Agent store and look for agents \"Built by Microsoft\". Frontier program agents will be tagged with \"(Frontier)\" at the end of the agents name.",
  onUpdateAgentsDesc
}: { 
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetToDefaults: () => void
  hasChanges: boolean
  onSave: () => void
  textConfig: TextConfig
  updateTextConfig: (updates: Partial<TextConfig>) => void
  sectionTitleApps?: string
  sectionTitleOffice?: string
  onUpdateSectionTitleApps?: (value: string) => void
  onUpdateSectionTitleOffice?: (value: string) => void
  sectionDescApps?: string
  onUpdateSectionDescApps?: (value: string) => void
  sectionDescOffice?: string
  onUpdateSectionDescOffice?: (value: string) => void
  agentsTitle?: string
  onUpdateAgentsTitle?: (value: string) => void
  agentsDesc?: string
  onUpdateAgentsDesc?: (value: string) => void
}) {
  const [activeTab, setActiveTab] = useState('apps')

  return (
    <Card className="max-w-2xl w-full h-[1050px]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-semibold">Turn on Frontier features</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>The Frontier program gives your organization early, hands-on access to experimental features from Microsoft. All Frontier features and agents are previews and might not be released to general availability. Configure access settings below for where users can experience Frontier.</p>
          <p>To get the most out of the Frontier program, we recommend turning it on for all apps and agents.</p>
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
                <h3 className="font-medium mb-2">
                  {onUpdateSectionTitleApps ? (
                    <EditableText
                      value={sectionTitleApps}
                      onChange={onUpdateSectionTitleApps}
                      className="font-medium"
                    />
                  ) : (
                    sectionTitleApps
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {onUpdateSectionDescApps ? (
                    <EditableText
                      value={sectionDescApps}
                      onChange={onUpdateSectionDescApps}
                      className="text-sm text-muted-foreground"
                      isDescription={true}
                    />
                  ) : (
                    sectionDescApps
                  )}
                </p>
              </div>

              <RadioGroup value={settings.allApps} onValueChange={(v) => {
                const value = v as AccessLevel;
                updateSettings({ allApps: value, allAppsGroups: value !== 'specific-groups' ? [] : settings.allAppsGroups });
              }} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-access" id="enhanced-v1-apps-no-access" className="border-black" />
                  <Label htmlFor="enhanced-v1-apps-no-access" className="font-normal">
                    <EditableText
                      value={textConfig['enhanced-v1'].apps.labels.noAccess}
                      onChange={(newValue) => updateTextConfig({
                        'enhanced-v1': {
                          ...textConfig['enhanced-v1'],
                          apps: { 
                            ...textConfig['enhanced-v1'].apps, 
                            labels: { ...textConfig['enhanced-v1'].apps.labels, noAccess: newValue }
                          }
                        }
                      })}
                    />
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-2">
                  <EditableText
                    value={textConfig['enhanced-v1'].apps.descriptions.noAccess}
                    onChange={(newValue) => updateTextConfig({
                      'enhanced-v1': {
                        ...textConfig['enhanced-v1'],
                        apps: { 
                          ...textConfig['enhanced-v1'].apps, 
                          descriptions: { ...textConfig['enhanced-v1'].apps.descriptions, noAccess: newValue }
                        }
                      }
                    })}
                    className="text-xs text-muted-foreground"
                    isDescription={true}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all-users" id="enhanced-v1-apps-all-users" className="border-black" />
                  <Label htmlFor="enhanced-v1-apps-all-users" className="font-normal">
                    <EditableText
                      value={textConfig['enhanced-v1'].apps.labels.allUsers}
                      onChange={(newValue) => updateTextConfig({
                        'enhanced-v1': {
                          ...textConfig['enhanced-v1'],
                          apps: { 
                            ...textConfig['enhanced-v1'].apps, 
                            labels: { ...textConfig['enhanced-v1'].apps.labels, allUsers: newValue }
                          }
                        }
                      })}
                    />
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-2">
                  <EditableText
                    value={textConfig['enhanced-v1'].apps.descriptions.allUsers}
                    onChange={(newValue) => updateTextConfig({
                      'enhanced-v1': {
                        ...textConfig['enhanced-v1'],
                        apps: { 
                          ...textConfig['enhanced-v1'].apps, 
                          descriptions: { ...textConfig['enhanced-v1'].apps.descriptions, allUsers: newValue }
                        }
                      }
                    })}
                    className="text-xs text-muted-foreground"
                    isDescription={true}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific-groups" id="enhanced-v1-apps-specific-groups" className="border-black" />
                  <Label htmlFor="enhanced-v1-apps-specific-groups" className="font-normal">
                    <EditableText
                      value={textConfig['enhanced-v1'].apps.labels.specificGroups}
                      onChange={(newValue) => updateTextConfig({
                        'enhanced-v1': {
                          ...textConfig['enhanced-v1'],
                          apps: { 
                            ...textConfig['enhanced-v1'].apps, 
                            labels: { ...textConfig['enhanced-v1'].apps.labels, specificGroups: newValue }
                          }
                        }
                      })}
                    />
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6 -mt-2">
                  <EditableText
                    value={textConfig['enhanced-v1'].apps.descriptions.specificGroups}
                    onChange={(newValue) => updateTextConfig({
                      'enhanced-v1': {
                        ...textConfig['enhanced-v1'],
                        apps: { 
                          ...textConfig['enhanced-v1'].apps, 
                          descriptions: { ...textConfig['enhanced-v1'].apps.descriptions, specificGroups: newValue }
                        }
                      }
                    })}
                    className="text-xs text-muted-foreground"
                    isDescription={true}
                  />
                </div>
                {settings.allApps === 'specific-groups' && (
                  <div className="ml-6">
                    <GroupManager
                      groups={settings.allAppsGroups}
                      onAddGroup={(group) => updateSettings({ allAppsGroups: [...settings.allAppsGroups, group] })}
                      onRemoveGroup={(index) => updateSettings({ allAppsGroups: settings.allAppsGroups.filter((_, i) => i !== index) })}
                      inputId="enhanced-v1-apps-group-input"
                    />
                  </div>
                )}
              </RadioGroup>

              <div className="mt-8 pt-6 border-t">
                <div>
                  <h3 className="font-medium mb-2">
                    {onUpdateSectionTitleOffice ? (
                      <EditableText
                        value={sectionTitleOffice}
                        onChange={onUpdateSectionTitleOffice}
                        className="font-medium"
                      />
                    ) : (
                      sectionTitleOffice
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {onUpdateSectionDescOffice ? (
                      <EditableText
                        value={sectionDescOffice}
                        onChange={onUpdateSectionDescOffice}
                        className="text-sm text-muted-foreground"
                        isDescription={true}
                      />
                    ) : (
                      sectionDescOffice
                    )}
                  </p>
                </div>

                <RadioGroup value={settings.officeAppsAccess} onValueChange={(v) => {
                  const value = v as AccessLevel;
                  updateSettings({ officeAppsAccess: value, officeAppsGroups: value !== 'specific-groups' ? [] : settings.officeAppsGroups });
                }} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no-access" id="enhanced-v1-office-no-access" className="border-black" />
                    <Label htmlFor="enhanced-v1-office-no-access" className="font-normal">
                      <EditableText
                        value={textConfig['enhanced-v1'].office.labels.noAccess}
                        onChange={(newValue) => updateTextConfig({
                          'enhanced-v1': {
                            ...textConfig['enhanced-v1'],
                            office: { 
                              ...textConfig['enhanced-v1'].office, 
                              labels: { ...textConfig['enhanced-v1'].office.labels, noAccess: newValue }
                            }
                          }
                        })}
                      />
                    </Label>
                  </div>
                  <div className="text-xs text-muted-foreground ml-6 -mt-2">
                    <EditableText
                      value={textConfig['enhanced-v1'].office.descriptions.noAccess}
                      onChange={(newValue) => updateTextConfig({
                        'enhanced-v1': {
                          ...textConfig['enhanced-v1'],
                          office: { 
                            ...textConfig['enhanced-v1'].office, 
                            descriptions: { ...textConfig['enhanced-v1'].office.descriptions, noAccess: newValue }
                          }
                        }
                      })}
                      className="text-xs text-muted-foreground"
                      isDescription={true}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all-users" id="enhanced-v1-office-all-users" className="border-black" />
                    <Label htmlFor="enhanced-v1-office-all-users" className="font-normal">
                      <EditableText
                        value={textConfig['enhanced-v1'].office.labels.allUsers}
                        onChange={(newValue) => updateTextConfig({
                          'enhanced-v1': {
                            ...textConfig['enhanced-v1'],
                            office: { 
                              ...textConfig['enhanced-v1'].office, 
                              labels: { ...textConfig['enhanced-v1'].office.labels, allUsers: newValue }
                            }
                          }
                        })}
                      />
                    </Label>
                  </div>
                  <div className="text-xs text-muted-foreground ml-6 -mt-2">
                    <EditableText
                      value={textConfig['enhanced-v1'].office.descriptions.allUsers}
                      onChange={(newValue) => updateTextConfig({
                        'enhanced-v1': {
                          ...textConfig['enhanced-v1'],
                          office: { 
                            ...textConfig['enhanced-v1'].office, 
                            descriptions: { ...textConfig['enhanced-v1'].office.descriptions, allUsers: newValue }
                          }
                        }
                      })}
                      className="text-xs text-muted-foreground"
                      isDescription={true}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific-groups" id="enhanced-v1-office-specific-groups" className="border-black" />
                    <Label htmlFor="enhanced-v1-office-specific-groups" className="font-normal">
                      <EditableText
                        value={textConfig['enhanced-v1'].office.labels.specificGroups}
                        onChange={(newValue) => updateTextConfig({
                          'enhanced-v1': {
                            ...textConfig['enhanced-v1'],
                            office: { 
                              ...textConfig['enhanced-v1'].office, 
                              labels: { ...textConfig['enhanced-v1'].office.labels, specificGroups: newValue }
                            }
                          }
                        })}
                      />
                    </Label>
                  </div>
                  <div className="text-xs text-muted-foreground ml-6 -mt-2">
                    <EditableText
                      value={textConfig['enhanced-v1'].office.descriptions.specificGroups}
                      onChange={(newValue) => updateTextConfig({
                        'enhanced-v1': {
                          ...textConfig['enhanced-v1'],
                          office: { 
                            ...textConfig['enhanced-v1'].office, 
                            descriptions: { ...textConfig['enhanced-v1'].office.descriptions, specificGroups: newValue }
                          }
                        }
                      })}
                      className="text-xs text-muted-foreground"
                      isDescription={true}
                    />
                  </div>
                  {settings.officeAppsAccess === 'specific-groups' && (
                    <div className="ml-6">
                      <GroupManager
                        groups={settings.officeAppsGroups}
                        onAddGroup={(group) => updateSettings({ officeAppsGroups: [...settings.officeAppsGroups, group] })}
                        onRemoveGroup={(index) => updateSettings({ officeAppsGroups: settings.officeAppsGroups.filter((_, i) => i !== index) })}
                        inputId="enhanced-v1-office-group-input"
                      />
                    </div>
                  )}
                </RadioGroup>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-4 mt-6 flex-1">
              <div>
                <h3 className="font-bold mb-2">
                  {onUpdateAgentsTitle ? (
                    <EditableText
                      value={agentsTitle}
                      onChange={onUpdateAgentsTitle}
                      className="font-bold"
                    />
                  ) : (
                    agentsTitle
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {onUpdateAgentsDesc ? (
                    <EditableText
                      value={agentsDesc}
                      onChange={onUpdateAgentsDesc}
                      className="text-sm text-muted-foreground"
                      isDescription={true}
                    />
                  ) : (
                    agentsDesc
                  )}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="border-t pt-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults} 
            className="border-black"
            disabled={!hasChanges}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            variant={hasChanges ? "default" : "outline"}
            className={hasChanges ? "" : "border-black"}
            disabled={!hasChanges}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Create separate initial text configs for each option to avoid reference sharing
const getInitialTextConfig = () => JSON.parse(JSON.stringify(STATIC_TEXT_CONFIGS))

type DisplayVersion = 'enhanced-v1' | 'enhanced-v1-copy' | 'unified' | 'enhanced'

export default function App() {
  const [selectedVersion, setSelectedVersion] = useState<DisplayVersion>('enhanced-v1')
  
  // Settings for Option A (enhanced-v1)
  const [settingsA, setSettingsA] = useKV<Settings>('frontier-settings-enhanced-v1-v3', getDefaultSettings('enhanced-v1'))
  const [savedSettingsA, setSavedSettingsA] = useKV<Settings>('frontier-saved-settings-enhanced-v1-v3', getDefaultSettings('enhanced-v1'))
  const [textConfigA, setTextConfigA] = useKV<TextConfig>('frontier-text-config-enhanced-v1-v3', getInitialTextConfig())
  const [savedTextConfigA, setSavedTextConfigA] = useKV<TextConfig>('frontier-saved-text-config-enhanced-v1-v3', getInitialTextConfig())
  const [sectionTitleAppsA, setSectionTitleAppsA] = useKV<string>('frontier-section-title-apps-a-v1', 'Apps like Word, Excel, PowerPoint')
  const [savedSectionTitleAppsA, setSavedSectionTitleAppsA] = useKV<string>('frontier-saved-section-title-apps-a-v1', 'Apps like Word, Excel, PowerPoint')
  const [sectionTitleOfficeA, setSectionTitleOfficeA] = useKV<string>('frontier-section-title-office-a-v1', 'Other Apps')
  const [savedSectionTitleOfficeA, setSavedSectionTitleOfficeA] = useKV<string>('frontier-saved-section-title-office-a-v1', 'Other Apps')
  const [sectionDescAppsA, setSectionDescAppsA] = useKV<string>('frontier-section-desc-apps-a-v1', 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
  const [savedSectionDescAppsA, setSavedSectionDescAppsA] = useKV<string>('frontier-saved-section-desc-apps-a-v1', 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
  const [sectionDescOfficeA, setSectionDescOfficeA] = useKV<string>('frontier-section-desc-office-a-v1', 'Select which users automatically get Frontier features in other applications.')
  const [savedSectionDescOfficeA, setSavedSectionDescOfficeA] = useKV<string>('frontier-saved-section-desc-office-a-v1', 'Select which users automatically get Frontier features in other applications.')
  const [agentsTitleA, setAgentsTitleA] = useKV<string>('frontier-agents-title-a-v1', 'Get early access to AI agents built by Microsoft')
  const [savedAgentsTitleA, setSavedAgentsTitleA] = useKV<string>('frontier-saved-agents-title-a-v1', 'Get early access to AI agents built by Microsoft')
  const [agentsDescA, setAgentsDescA] = useKV<string>('frontier-agents-desc-a-v1', 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
  const [savedAgentsDescA, setSavedAgentsDescA] = useKV<string>('frontier-saved-agents-desc-a-v1', 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
  
  // Settings for Option B (enhanced-v1-copy)
  const [settingsACopy, setSettingsACopy] = useKV<Settings>('frontier-settings-enhanced-v1-copy-v3', getDefaultSettings('enhanced-v1'))
  const [savedSettingsACopy, setSavedSettingsACopy] = useKV<Settings>('frontier-saved-settings-enhanced-v1-copy-v3', getDefaultSettings('enhanced-v1'))
  const [textConfigACopy, setTextConfigACopy] = useKV<TextConfig>('frontier-text-config-enhanced-v1-copy-v3', getInitialTextConfig())
  const [savedTextConfigACopy, setSavedTextConfigACopy] = useKV<TextConfig>('frontier-saved-text-config-enhanced-v1-copy-v3', getInitialTextConfig())
  const [sectionTitleAppsACopy, setSectionTitleAppsACopy] = useKV<string>('frontier-section-title-apps-a-copy-v1', 'Apps like Word, Excel, PowerPoint')
  const [savedSectionTitleAppsACopy, setSavedSectionTitleAppsACopy] = useKV<string>('frontier-saved-section-title-apps-a-copy-v1', 'Apps like Word, Excel, PowerPoint')
  const [sectionTitleOfficeACopy, setSectionTitleOfficeACopy] = useKV<string>('frontier-section-title-office-a-copy-v1', 'Other Apps')
  const [savedSectionTitleOfficeACopy, setSavedSectionTitleOfficeACopy] = useKV<string>('frontier-saved-section-title-office-a-copy-v1', 'Other Apps')
  const [sectionDescAppsACopy, setSectionDescAppsACopy] = useKV<string>('frontier-section-desc-apps-a-copy-v1', 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
  const [savedSectionDescAppsACopy, setSavedSectionDescAppsACopy] = useKV<string>('frontier-saved-section-desc-apps-a-copy-v1', 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
  const [sectionDescOfficeACopy, setSectionDescOfficeACopy] = useKV<string>('frontier-section-desc-office-a-copy-v1', 'Select which users automatically get Frontier features in other applications.')
  const [savedSectionDescOfficeACopy, setSavedSectionDescOfficeACopy] = useKV<string>('frontier-saved-section-desc-office-a-copy-v1', 'Select which users automatically get Frontier features in other applications.')
  const [agentsTitleACopy, setAgentsTitleACopy] = useKV<string>('frontier-agents-title-a-copy-v1', 'Get early access to AI agents built by Microsoft')
  const [savedAgentsTitleACopy, setSavedAgentsTitleACopy] = useKV<string>('frontier-saved-agents-title-a-copy-v1', 'Get early access to AI agents built by Microsoft')
  const [agentsDescACopy, setAgentsDescACopy] = useKV<string>('frontier-agents-desc-a-copy-v1', 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
  const [savedAgentsDescACopy, setSavedAgentsDescACopy] = useKV<string>('frontier-saved-agents-desc-a-copy-v1', 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
  
  // Settings for Unified (C)
  const [settingsUnified, setSettingsUnified] = useKV<Settings>('frontier-settings-unified-v3', getDefaultSettings('unified'))
  const [savedSettingsUnified, setSavedSettingsUnified] = useKV<Settings>('frontier-saved-settings-unified-v3', getDefaultSettings('unified'))
  const [textConfigUnified, setTextConfigUnified] = useKV<TextConfig>('frontier-text-config-unified-v3', getInitialTextConfig())
  const [savedTextConfigUnified, setSavedTextConfigUnified] = useKV<TextConfig>('frontier-saved-text-config-unified-v3', getInitialTextConfig())
  
  // Settings for Enhanced (D)
  const [settingsEnhanced, setSettingsEnhanced] = useKV<Settings>('frontier-settings-enhanced-v3', getDefaultSettings('enhanced'))
  const [savedSettingsEnhanced, setSavedSettingsEnhanced] = useKV<Settings>('frontier-saved-settings-enhanced-v3', getDefaultSettings('enhanced'))
  const [textConfigEnhanced, setTextConfigEnhanced] = useKV<TextConfig>('frontier-text-config-enhanced-v3', getInitialTextConfig())
  const [savedTextConfigEnhanced, setSavedTextConfigEnhanced] = useKV<TextConfig>('frontier-saved-text-config-enhanced-v3', getInitialTextConfig())

  // Deep merge utility for nested objects
  const deepMerge = (target: any, source: any): any => {
    const result = JSON.parse(JSON.stringify(target))
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }

  // Deep merge text config to ensure all nested properties exist
  const mergeTextConfig = (base: TextConfig, override: any): TextConfig => {
    if (!override) return JSON.parse(JSON.stringify(base))
    
    const result = JSON.parse(JSON.stringify(base))
    
    if (override.unified) {
      result.unified = {
        apps: { 
          labels: { ...base.unified.apps.labels, ...(override.unified.apps?.labels || {}) },
          descriptions: { ...base.unified.apps.descriptions, ...(override.unified.apps?.descriptions || {}) }
        },
        agents: { ...base.unified.agents, ...override.unified.agents }
      }
    }
    if (override.separated) {
      result.separated = {
        office: { 
          labels: { ...base.separated.office.labels, ...(override.separated.office?.labels || {}) },
          descriptions: { ...base.separated.office.descriptions, ...(override.separated.office?.descriptions || {}) }
        },
        webApps: { 
          labels: { ...base.separated.webApps.labels, ...(override.separated.webApps?.labels || {}) },
          descriptions: { ...base.separated.webApps.descriptions, ...(override.separated.webApps?.descriptions || {}) }
        },
        agents: { ...base.separated.agents, ...override.separated.agents }
      }
    }
    if (override.enhanced) {
      result.enhanced = {
        apps: { 
          labels: { ...base.enhanced.apps.labels, ...(override.enhanced.apps?.labels || {}) },
          descriptions: { ...base.enhanced.apps.descriptions, ...(override.enhanced.apps?.descriptions || {}) }
        },
        agents: { ...base.enhanced.agents, ...override.enhanced.agents }
      }
    }
    if (override['enhanced-v1']) {
      result['enhanced-v1'] = {
        apps: { 
          labels: { ...base['enhanced-v1'].apps.labels, ...(override['enhanced-v1'].apps?.labels || {}) },
          descriptions: { ...base['enhanced-v1'].apps.descriptions, ...(override['enhanced-v1'].apps?.descriptions || {}) }
        },
        office: { 
          labels: { ...base['enhanced-v1'].office.labels, ...(override['enhanced-v1'].office?.labels || {}) },
          descriptions: { ...base['enhanced-v1'].office.descriptions, ...(override['enhanced-v1'].office?.descriptions || {}) }
        },
        agents: { ...base['enhanced-v1'].agents, ...override['enhanced-v1'].agents }
      }
    }
    
    return result
  }
  
  // Option A state
  const currentSettingsA = JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced-v1'), ...settingsA }))
  const currentSavedSettingsA = JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced-v1'), ...savedSettingsA }))
  const currentTextConfigA = mergeTextConfig(getInitialTextConfig(), textConfigA)
  const currentSavedTextConfigA = mergeTextConfig(getInitialTextConfig(), savedTextConfigA)
  
  const updateSettingsA = (updates: Partial<Settings>) => {
    setSettingsA(current => JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced-v1'), ...current, ...updates })))
  }

  const updateTextConfigA = (updates: Partial<TextConfig>) => {
    setTextConfigA(current => {
      const base = current || getInitialTextConfig()
      return deepMerge(base, updates)
    })
  }

  const hasChangesA = (
    JSON.stringify(currentSettingsA) !== JSON.stringify(currentSavedSettingsA) ||
    JSON.stringify(currentTextConfigA) !== JSON.stringify(currentSavedTextConfigA) ||
    sectionTitleAppsA !== savedSectionTitleAppsA ||
    sectionTitleOfficeA !== savedSectionTitleOfficeA ||
    sectionDescAppsA !== savedSectionDescAppsA ||
    sectionDescOfficeA !== savedSectionDescOfficeA ||
    agentsTitleA !== savedAgentsTitleA ||
    agentsDescA !== savedAgentsDescA
  )

  const handleSaveA = () => {
    setSavedSettingsA(JSON.parse(JSON.stringify(currentSettingsA)))
    setSavedTextConfigA(JSON.parse(JSON.stringify(currentTextConfigA)))
    setSavedSectionTitleAppsA(sectionTitleAppsA || 'Apps like Word, Excel, PowerPoint')
    setSavedSectionTitleOfficeA(sectionTitleOfficeA || 'Other Apps')
    setSavedSectionDescAppsA(sectionDescAppsA || 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
    setSavedSectionDescOfficeA(sectionDescOfficeA || 'Select which users automatically get Frontier features in other applications.')
    setSavedAgentsTitleA(agentsTitleA || 'Get early access to AI agents built by Microsoft')
    setSavedAgentsDescA(agentsDescA || 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
    toast.success('Settings saved successfully')
  }

  const resetToDefaultsA = () => {
    setSettingsA(JSON.parse(JSON.stringify(currentSavedSettingsA)))
    setTextConfigA(JSON.parse(JSON.stringify(currentSavedTextConfigA)))
    setSectionTitleAppsA(savedSectionTitleAppsA || 'Apps like Word, Excel, PowerPoint')
    setSectionTitleOfficeA(savedSectionTitleOfficeA || 'Other Apps')
    setSectionDescAppsA(savedSectionDescAppsA || 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
    setSectionDescOfficeA(savedSectionDescOfficeA || 'Select which users automatically get Frontier features in other applications.')
    setAgentsTitleA(savedAgentsTitleA || 'Get early access to AI agents built by Microsoft')
    setAgentsDescA(savedAgentsDescA || 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
  }
  
  // Option A Copy state
  const currentSettingsACopy = JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced-v1'), ...settingsACopy }))
  const currentSavedSettingsACopy = JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced-v1'), ...savedSettingsACopy }))
  const currentTextConfigACopy = mergeTextConfig(getInitialTextConfig(), textConfigACopy)
  const currentSavedTextConfigACopy = mergeTextConfig(getInitialTextConfig(), savedTextConfigACopy)
  
  const updateSettingsACopy = (updates: Partial<Settings>) => {
    setSettingsACopy(current => JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced-v1'), ...current, ...updates })))
  }

  const updateTextConfigACopy = (updates: Partial<TextConfig>) => {
    setTextConfigACopy(current => {
      const base = current || getInitialTextConfig()
      return deepMerge(base, updates)
    })
  }

  const hasChangesACopy = (
    JSON.stringify(currentSettingsACopy) !== JSON.stringify(currentSavedSettingsACopy) ||
    JSON.stringify(currentTextConfigACopy) !== JSON.stringify(currentSavedTextConfigACopy) ||
    sectionTitleAppsACopy !== savedSectionTitleAppsACopy ||
    sectionTitleOfficeACopy !== savedSectionTitleOfficeACopy ||
    sectionDescAppsACopy !== savedSectionDescAppsACopy ||
    sectionDescOfficeACopy !== savedSectionDescOfficeACopy ||
    agentsTitleACopy !== savedAgentsTitleACopy ||
    agentsDescACopy !== savedAgentsDescACopy
  )

  const handleSaveACopy = () => {
    setSavedSettingsACopy(JSON.parse(JSON.stringify(currentSettingsACopy)))
    setSavedTextConfigACopy(JSON.parse(JSON.stringify(currentTextConfigACopy)))
    setSavedSectionTitleAppsACopy(sectionTitleAppsACopy || 'Apps like Word, Excel, PowerPoint')
    setSavedSectionTitleOfficeACopy(sectionTitleOfficeACopy || 'Other Apps')
    setSavedSectionDescAppsACopy(sectionDescAppsACopy || 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
    setSavedSectionDescOfficeACopy(sectionDescOfficeACopy || 'Select which users automatically get Frontier features in other applications.')
    setSavedAgentsTitleACopy(agentsTitleACopy || 'Get early access to AI agents built by Microsoft')
    setSavedAgentsDescACopy(agentsDescACopy || 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
    toast.success('Settings saved successfully')
  }

  const resetToDefaultsACopy = () => {
    setSettingsACopy(JSON.parse(JSON.stringify(currentSavedSettingsACopy)))
    setTextConfigACopy(JSON.parse(JSON.stringify(currentSavedTextConfigACopy)))
    setSectionTitleAppsACopy(savedSectionTitleAppsACopy || 'Apps like Word, Excel, PowerPoint')
    setSectionTitleOfficeACopy(savedSectionTitleOfficeACopy || 'Other Apps')
    setSectionDescAppsACopy(savedSectionDescAppsACopy || 'By default, Frontier features are turned off in Office applications, but all users can choose to turn them on')
    setSectionDescOfficeACopy(savedSectionDescOfficeACopy || 'Select which users automatically get Frontier features in other applications.')
    setAgentsTitleACopy(savedAgentsTitleACopy || 'Get early access to AI agents built by Microsoft')
    setAgentsDescACopy(savedAgentsDescACopy || 'The Frontier program gives you early access to Microsoft\'s pre-built AI agents. Go to the Agent store and look for agents "Built by Microsoft". Frontier program agents will be tagged with "(Frontier)" at the end of the agents name.')
  }
  
  // Unified version (C) state
  const currentSettingsUnified = JSON.parse(JSON.stringify({ ...getDefaultSettings('unified'), ...settingsUnified }))
  const currentSavedSettingsUnified = JSON.parse(JSON.stringify({ ...getDefaultSettings('unified'), ...savedSettingsUnified }))
  const currentTextConfigUnified = mergeTextConfig(getInitialTextConfig(), textConfigUnified)
  const currentSavedTextConfigUnified = mergeTextConfig(getInitialTextConfig(), savedTextConfigUnified)
  
  const updateSettingsUnified = (updates: Partial<Settings>) => {
    setSettingsUnified(current => JSON.parse(JSON.stringify({ ...getDefaultSettings('unified'), ...current, ...updates })))
  }

  const updateTextConfigUnified = (updates: Partial<TextConfig>) => {
    setTextConfigUnified(current => {
      const base = current || getInitialTextConfig()
      return deepMerge(base, updates)
    })
  }

  const hasChangesUnified = (
    JSON.stringify(currentSettingsUnified) !== JSON.stringify(currentSavedSettingsUnified) ||
    JSON.stringify(currentTextConfigUnified) !== JSON.stringify(currentSavedTextConfigUnified)
  )

  const handleSaveUnified = () => {
    setSavedSettingsUnified(JSON.parse(JSON.stringify(currentSettingsUnified)))
    setSavedTextConfigUnified(JSON.parse(JSON.stringify(currentTextConfigUnified)))
    toast.success('Settings saved successfully')
  }

  const resetToDefaultsUnified = () => {
    setSettingsUnified(JSON.parse(JSON.stringify(currentSavedSettingsUnified)))
    setTextConfigUnified(JSON.parse(JSON.stringify(currentSavedTextConfigUnified)))
  }
  
  // Enhanced version (D) state
  const currentSettingsEnhanced = JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced'), ...settingsEnhanced }))
  const currentSavedSettingsEnhanced = JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced'), ...savedSettingsEnhanced }))
  const currentTextConfigEnhanced = mergeTextConfig(getInitialTextConfig(), textConfigEnhanced)
  const currentSavedTextConfigEnhanced = mergeTextConfig(getInitialTextConfig(), savedTextConfigEnhanced)
  
  const updateSettingsEnhanced = (updates: Partial<Settings>) => {
    setSettingsEnhanced(current => JSON.parse(JSON.stringify({ ...getDefaultSettings('enhanced'), ...current, ...updates })))
  }

  const updateTextConfigEnhanced = (updates: Partial<TextConfig>) => {
    setTextConfigEnhanced(current => {
      const base = current || getInitialTextConfig()
      return deepMerge(base, updates)
    })
  }

  const hasChangesEnhanced = (
    JSON.stringify(currentSettingsEnhanced) !== JSON.stringify(currentSavedSettingsEnhanced) ||
    JSON.stringify(currentTextConfigEnhanced) !== JSON.stringify(currentSavedTextConfigEnhanced)
  )

  const handleSaveEnhanced = () => {
    setSavedSettingsEnhanced(JSON.parse(JSON.stringify(currentSettingsEnhanced)))
    setSavedTextConfigEnhanced(JSON.parse(JSON.stringify(currentTextConfigEnhanced)))
    toast.success('Settings saved successfully')
  }

  const resetToDefaultsEnhanced = () => {
    setSettingsEnhanced(JSON.parse(JSON.stringify(currentSavedSettingsEnhanced)))
    setTextConfigEnhanced(JSON.parse(JSON.stringify(currentSavedTextConfigEnhanced)))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-8 gap-8">
      <div className="flex gap-4">
        <Button
          variant={selectedVersion === 'enhanced-v1' ? "default" : "outline"}
          onClick={() => setSelectedVersion('enhanced-v1')}
          className="border-black"
        >A. Office (win32&WAC)</Button>
        <Button
          variant={selectedVersion === 'enhanced-v1-copy' ? "default" : "outline"}
          onClick={() => setSelectedVersion('enhanced-v1-copy')}
          className="border-black"
        >B. Office (win32&WAC)</Button>
        <Button
          variant={selectedVersion === 'unified' ? "default" : "outline"}
          onClick={() => setSelectedVersion('unified')}
          className="border-black"
        >C. No Toggle</Button>
        <Button
          variant={selectedVersion === 'enhanced' ? "default" : "outline"}
          onClick={() => setSelectedVersion('enhanced')}
          className="border-black"
        >D. Office win32 Toggle Only</Button>
      </div>
      {selectedVersion === 'enhanced-v1' && (
        <div className="flex gap-8 items-start">
          <EnhancedV1Version 
            settings={currentSettingsA} 
            updateSettings={updateSettingsA} 
            resetToDefaults={resetToDefaultsA} 
            hasChanges={hasChangesA} 
            onSave={handleSaveA}
            textConfig={currentTextConfigA}
            updateTextConfig={updateTextConfigA}
            sectionTitleApps={sectionTitleAppsA}
            sectionTitleOffice={sectionTitleOfficeA}
            onUpdateSectionTitleApps={setSectionTitleAppsA}
            onUpdateSectionTitleOffice={setSectionTitleOfficeA}
            sectionDescApps={sectionDescAppsA}
            onUpdateSectionDescApps={setSectionDescAppsA}
            sectionDescOffice={sectionDescOfficeA}
            onUpdateSectionDescOffice={setSectionDescOfficeA}
            agentsTitle={agentsTitleA}
            onUpdateAgentsTitle={setAgentsTitleA}
            agentsDesc={agentsDescA}
            onUpdateAgentsDesc={setAgentsDescA}
          />
        </div>
      )}
      {selectedVersion === 'enhanced-v1-copy' && (
        <div className="flex gap-8 items-start">
          <EnhancedV1Version 
            settings={currentSettingsACopy} 
            updateSettings={updateSettingsACopy} 
            resetToDefaults={resetToDefaultsACopy} 
            hasChanges={hasChangesACopy} 
            onSave={handleSaveACopy}
            textConfig={currentTextConfigACopy}
            updateTextConfig={updateTextConfigACopy}
            sectionTitleApps={sectionTitleAppsACopy}
            sectionTitleOffice={sectionTitleOfficeACopy}
            onUpdateSectionTitleApps={setSectionTitleAppsACopy}
            onUpdateSectionTitleOffice={setSectionTitleOfficeACopy}
            sectionDescApps={sectionDescAppsACopy}
            onUpdateSectionDescApps={setSectionDescAppsACopy}
            sectionDescOffice={sectionDescOfficeACopy}
            onUpdateSectionDescOffice={setSectionDescOfficeACopy}
            agentsTitle={agentsTitleACopy}
            onUpdateAgentsTitle={setAgentsTitleACopy}
            agentsDesc={agentsDescACopy}
            onUpdateAgentsDesc={setAgentsDescACopy}
          />
        </div>
      )}
      {selectedVersion === 'unified' && (
        <UnifiedVersion 
          settings={currentSettingsUnified} 
          updateSettings={updateSettingsUnified} 
          resetToDefaults={resetToDefaultsUnified} 
          hasChanges={hasChangesUnified} 
          onSave={handleSaveUnified}
          textConfig={currentTextConfigUnified}
          updateTextConfig={updateTextConfigUnified}
        />
      )}
      {selectedVersion === 'enhanced' && (
        <EnhancedVersion 
          settings={currentSettingsEnhanced} 
          updateSettings={updateSettingsEnhanced} 
          resetToDefaults={resetToDefaultsEnhanced} 
          hasChanges={hasChangesEnhanced} 
          onSave={handleSaveEnhanced}
          textConfig={currentTextConfigEnhanced}
          updateTextConfig={updateTextConfigEnhanced}
        />
      )}
      <Toaster />
    </div>
  );
}