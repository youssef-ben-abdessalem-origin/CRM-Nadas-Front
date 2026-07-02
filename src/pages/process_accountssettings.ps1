$file = "C:\Users\The Ice Flame\Desktop\NADAS\CRM\CRM-Nadas-Front\src\pages\AccountsSettingsPage.tsx"
$content = Get-Content $file -Raw

# Toast messages with interpolation
$content = $content.Replace('toast.success(`${type} created successfully`)', 'toast.success(t("accountsSettings.statusUpdates.created", { type }))')
$content = $content.Replace('toast.success(`${type} updated successfully`)', 'toast.success(t("accountsSettings.statusUpdates.updated", { type }))')
$content = $content.Replace('toast.success(`${type} deleted successfully`)', 'toast.success(t("accountsSettings.statusUpdates.deleted", { type }))')
$content = $content.Replace('toast.error("Name is required")', 'toast.error(t("accountsSettings.errors.nameRequired"))')
$content = $content.Replace('toast.error("Cannot delete the default item")', 'toast.error(t("accountsSettings.errors.cannotDeleteDefault"))')

# Confirm dialog
$content = $content.Replace('title: `Delete ${type}`', 'title: t("accountsSettings.deleteDialog.title", { type })')
$content = $content.Replace('description: `Are you sure you want to delete the "${item.name}" ${type.toLowerCase()}? This action cannot be undone and may affect associated accounts.`', 'description: t("accountsSettings.deleteDialog.description", { type, itemName: item.name })')
$content = $content.Replace('confirmText: "Delete"', 'confirmText: t("common.delete")')

# Layout
$content = $content.Replace('<CRMLayout title="Account Settings">', '<CRMLayout title={t("accountsSettings.pageTitle")}>')
$content = $content.Replace('<h1 className="text-2xl font-bold">Account Settings</h1>', '<h1 className="text-2xl font-bold">{t("accountsSettings.pageTitle")}</h1>')

# Tabs
$content = $content.Replace('<TabsTrigger value="types">Types</TabsTrigger>', '<TabsTrigger value="types">{t("accountsSettings.tabs.types")}</TabsTrigger>')
$content = $content.Replace('<TabsTrigger value="statuses">Statuses</TabsTrigger>', '<TabsTrigger value="statuses">{t("accountsSettings.tabs.statuses")}</TabsTrigger>')
$content = $content.Replace('<TabsTrigger value="tiers">Tiers</TabsTrigger>', '<TabsTrigger value="tiers">{t("accountsSettings.tabs.tiers")}</TabsTrigger>')

# OptionTable component
$content = $content.Replace('<CardTitle className="capitalize">{type}s</CardTitle>', '<CardTitle className="capitalize">{t("accountsSettings.sectionTitle", { type })}</CardTitle>')
$content = $content.Replace('<CardDescription>Manage your account {type.toLowerCase()}s</CardDescription>', '<CardDescription>{t("accountsSettings.sectionDescription", { type })}</CardDescription>')
$content = $content.Replace('<Plus className="h-4 w-4 mr-2" />', '<Plus className="h-4 w-4 mr-2" /> {t("accountsSettings.addItem", { type })}')
$content = $content.Replace('          Add {type}', '          {t("accountsSettings.addItem", { type })}')
$content = $content.Replace('<TableHead>Name</TableHead>', '<TableHead>{t("common.name")}</TableHead>')
$content = $content.Replace('<TableHead>Color</TableHead>', '<TableHead>{t("common.color")}</TableHead>')
$content = $content.Replace('<TableHead>Default</TableHead>', '<TableHead>{t("common.default")}</TableHead>')
$content = $content.Replace('<TableHead className="text-right">Actions</TableHead>', '<TableHead className="text-right">{t("common.actions")}</TableHead>')
$content = $content.Replace('<TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>', '<TableCell colSpan={4} className="text-center py-8">{t("common.loading")}</TableCell>')
$content = $content.Replace('No {type.toLowerCase()}s found', '{t("accountsSettings.noResults", { type })}')

# Add Dialog
$content = $content.Replace('<DialogTitle>Add {addType}</DialogTitle>', '<DialogTitle>{t("accountsSettings.addDialogTitle", { type: addType })}</DialogTitle>')
$content = $content.Replace('<DialogDescription>Create a new {addType.toLowerCase()} for accounts.</DialogDescription>', '<DialogDescription>{t("accountsSettings.addDialogDescription", { type: addType })}</DialogDescription>')
$content = $content.Replace('<Label>Name</Label>', '<Label>{t("common.name")}</Label>')
$content = $content.Replace('placeholder={`Enter ${addType.toLowerCase()} name`}', 'placeholder={t("accountsSettings.placeholders.name", { type: addType })}')
$content = $content.Replace('<Label>Color</Label>', '<Label>{t("common.color")}</Label>')
$content = $content.Replace('Cancel', '{t("common.cancel")}')
$content = $content.Replace('{createMutation.isPending ? "Creating..." : "Create"}', '{createMutation.isPending ? t("common.creating") : t("common.create")}')

# Edit Dialog
$content = $content.Replace('<DialogTitle>Edit {editingItem.type}</DialogTitle>', '<DialogTitle>{t("accountsSettings.editDialogTitle", { type: editingItem.type })}</DialogTitle>')
$content = $content.Replace('<DialogDescription>Update the {editingItem.type?.toLowerCase()} details.</DialogDescription>', '<DialogDescription>{t("accountsSettings.editDialogDescription", { type: editingItem.type })}</DialogDescription>')
$content = $content.Replace('placeholder="Enter name"', 'placeholder={t("accountsSettings.placeholders.editName")}')
$content = $content.Replace('{updateMutation.isPending ? "Saving..." : "Save Changes"}', '{updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}')

Set-Content -Path $file -Value $content -NoNewline
Write-Host "Processed AccountsSettingsPage.tsx"
