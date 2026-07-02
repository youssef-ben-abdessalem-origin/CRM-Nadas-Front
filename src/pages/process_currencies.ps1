$file = "C:\Users\The Ice Flame\Desktop\NADAS\CRM\CRM-Nadas-Front\src\pages\CurrenciesSettings.tsx"
$content = Get-Content $file -Raw

$replacements = @{
    'Currency created successfully' = 't("currencies.statusUpdates.created")'
    'Currency updated successfully' = 't("currencies.statusUpdates.updated")'
    'Currency deleted successfully' = 't("currencies.statusUpdates.deleted")'
    'Please fill in required fields' = 't("currencies.errors.requiredFields")'
    'title: "Delete Currency"' = 'title: t("currencies.deleteDialog.title")'
    'description: "Are you sure you want to delete this currency? This may affect records currently using this location."' = 'description: t("currencies.deleteDialog.description")'
    'confirmText: "Delete"' = 'confirmText: t("currencies.deleteDialog.confirmText")'
    '<p className="text-muted-foreground">Manage currencies and exchange rates</p>' = '<p className="text-muted-foreground">{t("currencies.subtitle")}</p>'
    '<Plus className="h-4 w-4 mr-2" /> Add Currency' = '<Plus className="h-4 w-4 mr-2" /> {t("currencies.addCurrency")}'
    '<TableHead>Name</TableHead>' = '<TableHead>{t("common.name")}</TableHead>'
    '<TableHead>Code</TableHead>' = '<TableHead>{t("currencies.code")}</TableHead>'
    '<TableHead>Symbol</TableHead>' = '<TableHead>{t("currencies.symbol")}</TableHead>'
    '<TableHead>Exchange Rate</TableHead>' = '<TableHead>{t("currencies.exchangeRate")}</TableHead>'
    '<TableHead>Status</TableHead>' = '<TableHead>{t("common.status")}</TableHead>'
    '<TableHead className="text-right">Actions</TableHead>' = '<TableHead className="text-right">{t("common.actions")}</TableHead>'
    'No currencies found' = '{t("currencies.noResults")}'
    '<Badge className="bg-green-500">Default</Badge>' = '<Badge className="bg-green-500">{t("common.default")}</Badge>'
    '<Badge variant="secondary">Inactive</Badge>' = '<Badge variant="secondary">{t("common.inactive")}</Badge>'
    '<DialogTitle>{editingCurrency ? "Edit Currency" : "Add Currency"}</DialogTitle>' = '<DialogTitle>{editingCurrency ? t("currencies.edit") : t("currencies.add")}</DialogTitle>'
    '<Label>Name *</Label>' = '<Label>{t("common.name")} *</Label>'
    '<Label>Code *</Label>' = '<Label>{t("currencies.code")} *</Label>'
    '<Label>Symbol</Label>' = '<Label>{t("currencies.symbol")}</Label>'
    '<Label>Exchange Rate (vs USD)</Label>' = '<Label>{t("currencies.exchangeRate")} (vs USD)</Label>'
    '<Label htmlFor="isDefault">Set as default currency</Label>' = '<Label htmlFor="isDefault">{t("currencies.setDefault")}</Label>'
    '{editingCurrency ? "Update" : "Create"}' = '{editingCurrency ? t("common.update") : t("common.create")}'
    '<CRMLayout title="Currencies">' = '<CRMLayout title={t("currencies.pageTitle")}>'
    '<h1 className="text-2xl font-bold">Currencies</h1>' = '<h1 className="text-2xl font-bold">{t("currencies.pageTitle")}</h1>'
    'placeholder="USD"' = 'placeholder={t("currencies.codePlaceholder")}'
    'placeholder="$"' = 'placeholder={t("currencies.symbolPlaceholder")}'
    'placeholder="United States Dollar"' = 'placeholder={t("currencies.namePlaceholder")}'
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

Set-Content -Path $file -Value $content -NoNewline
Write-Host "Made $count replacements in CurrenciesSettings.tsx"
