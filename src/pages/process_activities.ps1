$file = "C:\Users\The Ice Flame\Desktop\NADAS\CRM\CRM-Nadas-Front\src\pages\ActivityTypesSettings.tsx"
$content = Get-Content $file -Raw

$replacements = @{
    'toast.success("Activity type created successfully")' = 'toast.success(t("activityTypes.statusUpdates.created"))'
    'toast.success("Activity type updated successfully")' = 'toast.success(t("activityTypes.statusUpdates.updated"))'
    'toast.success("Activity type deleted successfully")' = 'toast.success(t("activityTypes.statusUpdates.deleted"))'
    'toast.error("Please fill in required fields")' = 'toast.error(t("activityTypes.errors.requiredFields"))'
    'title: "Delete Activity Type"' = 'title: t("activityTypes.deleteDialog.title")'
    'description: "Are you sure you want to delete this activity type? Existing activities of this type may be affected."' = 'description: t("activityTypes.deleteDialog.description")'
    'confirmText: "Delete"' = 'confirmText: t("common.delete")'
    '<CRMLayout title="Activity Types">' = '<CRMLayout title={t("activityTypes.pageTitle")}>'
    # Loading state div - keep as-is, CRMLayout title already handled above
}

$count = 0
foreach ($old in $replacements.Keys) {
    if ($content.Contains($old)) {
        $content = $content.Replace($old, $replacements[$old])
        $count++
    } else {
        Write-Host "NOT FOUND: $old"
    }
}

# Handle patterns that appear multiple times
$content = $content.Replace('<div className="text-muted-foreground">Loading...</div>', '<div className="text-muted-foreground">{t("common.loading")}</div>')
$content = $content.Replace('<h1 className="text-2xl font-bold">Activity Types</h1>', '<h1 className="text-2xl font-bold">{t("activityTypes.pageTitle")}</h1>')
$content = $content.Replace('<p className="text-muted-foreground">Manage activity types</p>', '<p className="text-muted-foreground">{t("activityTypes.subtitle")}</p>')
$content = $content.Replace('<Plus className="h-4 w-4 mr-2" /> Add Activity Type', '<Plus className="h-4 w-4 mr-2" /> {t("activityTypes.add")}')
$content = $content.Replace('<TableHead>Name</TableHead>', '<TableHead>{t("common.name")}</TableHead>')
$content = $content.Replace('<TableHead>Icon</TableHead>', '<TableHead>{t("activityTypes.icon")}</TableHead>')
$content = $content.Replace('<TableHead>Status</TableHead>', '<TableHead>{t("common.status")}</TableHead>')
$content = $content.Replace('<TableHead className="text-right">Actions</TableHead>', '<TableHead className="text-right">{t("common.actions")}</TableHead>')
$content = $content.Replace('No activity types found', '{t("activityTypes.noResults")}')
$content = $content.Replace('<Badge variant="secondary">Inactive</Badge>', '<Badge variant="secondary">{t("common.inactive")}</Badge>')
$content = $content.Replace('{editingType ? "Edit Activity Type" : "Add Activity Type"}', '{editingType ? t("activityTypes.edit") : t("activityTypes.add")}')
$content = $content.Replace('<Label>Name *</Label>', '<Label>{t("common.name")} *</Label>')
$content = $content.Replace('placeholder="Call"', 'placeholder={t("activityTypes.namePlaceholder")}')
$content = $content.Replace('<Label>Icon</Label>', '<Label>{t("activityTypes.icon")}</Label>')
$content = $content.Replace('{editingType ? "Update" : "Create"}', '{editingType ? t("common.update") : t("common.create")}')

Set-Content -Path $file -Value $content -NoNewline
Write-Host "Processed ActivityTypesSettings.tsx"
