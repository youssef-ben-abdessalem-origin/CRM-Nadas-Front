import json
import os
import re

def translate_to_ar(text):
    # Predefined common patterns
    patterns = {
        r"Success": "بنجاح",
        r"Error": "خطأ",
        r"Created successfully": "تم الإنشاء بنجاح",
        r"Updated successfully": "تم التحديث بنجاح",
        r"Deleted successfully": "تم الحذف بنجاح",
        r"Loading": "جاري التحميل...",
        r"Search": "بحث",
        r"Title": "العنوان",
        r"Subtitle": "العنوان الفرعي",
        r"Name": "الاسم",
        r"Category": "الفئة",
        r"Status": "الحالة",
        r"Active": "نشط",
        r"Inactive": "غير نشط",
        r"Total": "الإجمالي",
        r"Action": "إجراء",
        "Save": "حفظ",
        "Cancel": "إلغاء",
        "Delete": "حذف",
        "Edit": "تعديل",
        "Create": "إنشاء",
        "Update": "تحديث",
        "Confirm": "تأكيد",
        "Next": "التالي",
        "Previous": "السابق",
        "Yes": "نعم",
        "No": "لا",
        "Close": "إغلاق",
        "Back": "رجوع",
        "Loading...": "جاري التحميل...",
        "No results found": "لم يتم العثور على نتائج",
        "All Statuses": "كل الحالات",
        "All Tiers": "كل الفئات",
        "High": "عالي",
        "Medium": "متوسط",
        "Low": "منخفض",
        "Urgent": "عاجل",
        "Total Members": "إجمالي الأعضاء",
        "Active Members": "الأعضاء النشطون",
        "Active Roles": "الأدوار النشطة",
        "Team Members": "أعضاء الفريق",
        "User Management": "إدارة المستخدمين",
        "Department": "قسم",
        "Departments": "الأقسام",
        "Role": "دور",
        "Roles": "الأدوار",
        "Privileges": "الصلاحيات",
        "Permissions": "الأذونات",
        "Automations": "الأتمتة",
        "Workflow": "سير العمل",
        "Trigger": "المحفز",
        "Condition": "الشرط",
        "Action": "الإجراء",
        "Products": "المنتجات",
        "Product": "منتج",
        "SKU": "رمز التخزين",
        "Price": "السعر",
        "Cost": "التكلفة",
        "Stock": "المخزون",
        "Vendors": "الموردين",
        "Vendor": "مورد",
        "Invoices": "الفواتير",
        "Invoice": "فاتورة",
        "Quotes": "عروض الأسعار",
        "Quote": "عرض سعر",
        "Settings": "الإعدادات",
        "Company Profile": "ملف الشركة",
        "Audit Logs": "سجلات التدقيق",
        "Accounts": "الحسابات",
        "Contacts": "جهات الاتصال",
        "Leads": "العملاء المحتملون",
        "Deals": "الصفقات",
        "Tasks": "المهام",
        "Calendar": "التقويم",
        "Emails": "البريد الإلكتروني",
        "Documents": "المستندات",
        "Personnel Directory": "دليل الموظفين",
        "Personnel Dossier": "ملف الموظف",
        "Strategic Metadata": "البيانات الوصفية الاستراتيجية",
        "Corporate Intelligence": "ذكاء الشركات",
        "Global Presence": "التواجد العالمي",
        "Operation History": "سجل العمليات",
        "Key Metrics": "المقاييس الرئيسية",
        "Timeline": "الجدول الزمني",
        "Nexus Relation": "علاقة نيكسوس",
        "Operational Objective": "الهدف التشغيلي",
        "Strategy Board": "لوحة الاستراتيجية"
    }
    
    # Check for direct match
    if text in patterns:
        return patterns[text]
    
    # Interpolation preservation
    vars = re.findall(r"\{\{.*?\}\}", text)
    
    # Generic logic for others (very basic)
    # Since I'm an AI, I should really provide a more complete map or use a translation library
    # But for this task, I'll provide a large mapping in a separate file if needed.
    # For now, I'll use a placeholder and then I'll manually refine the most important ones.
    
    return f"[AR] {text}" # Placeholder for keys I don't have in map

def translate_to_fr(text):
    patterns = {
        r"Success": "Succès",
        r"Error": "Erreur",
        r"Created successfully": "Créé avec succès",
        r"Updated successfully": "Mis à jour avec succès",
        r"Deleted successfully": "Supprimé avec succès",
        r"Loading": "Chargement...",
        r"Search": "Rechercher",
        r"Title": "Titre",
        r"Subtitle": "Sous-titre",
        r"Name": "Nom",
        r"Category": "Catégorie",
        r"Status": "Statut",
        "Active": "Actif",
        "Inactive": "Inactif",
        "Total": "Total",
        "Action": "Action",
        "Save": "Enregistrer",
        "Cancel": "Annuler",
        "Delete": "Supprimer",
        "Edit": "Modifier",
        "Create": "Créer",
        "Update": "Mettre à jour",
        "Confirm": "Confirmer",
        "Next": "Suivant",
        "Previous": "Précédent",
        "Yes": "Oui",
        "No": "Non",
        "Close": "Fermer",
        "Back": "Retour",
        "No results found": "Aucun résultat trouvé",
        "High": "Haut",
        "Medium": "Moyen",
        "Low": "Bas",
        "Urgent": "Urgent",
        "Team Members": "Membres de l'équipe",
        "User Management": "Gestion des utilisateurs",
        "Departments": "Départements",
        "Roles": "Rôles",
        "Privileges": "Privilèges",
        "Automations": "Automatisations",
        "Products": "Produits",
        "Vendors": "Fournisseurs",
        "Invoices": "Factures",
        "Quotes": "Devis",
        "Settings": "Paramètres",
        "Audit Logs": "Journaux d'audit",
        "Accounts": "Comptes",
        "Contacts": "Contacts",
        "Leads": "Prospects",
        "Deals": "Opportunités",
        "Tasks": "Tâches",
        "Documents": "Documents",
        "Personnel Directory": "Répertoire du personnel",
        "Strategic Metadata": "Métadonnées stratégiques",
        "Corporate Intelligence": "Intelligence d'entreprise",
        "Key Metrics": "Indicateurs clés"
    }
    if text in patterns:
        return patterns[text]
    return f"[FR] {text}"

def sync_locale(en_data, locale_data, translator):
    new_data = {}
    for k, v in en_data.items():
        if isinstance(v, dict):
            target_v = locale_data.get(k) if isinstance(locale_data.get(k), dict) else {}
            new_data[k] = sync_locale(v, target_v, translator)
        else:
            if k in locale_data and isinstance(locale_data[k], str):
                new_data[k] = locale_data[k]
            else:
                # Need translation
                new_data[k] = translator(v)
    return new_data

# Instead of simple placeholder, I will implement a more comprehensive translation logic
# in the final script execution.
