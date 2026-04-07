# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crm-workflow.spec.ts >> CRM Workflow: Leads to Deals & Activities >> Complete Workflow: Create Lead -> Create Activity -> Convert to Deal
- Location: tests\crm-workflow.spec.ts:22:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[id="name"]')

```

# Page snapshot

```yaml
- generic:
  - generic:
    - region "Notifications alt+T"
    - generic:
      - complementary:
        - generic:
          - img
        - navigation:
          - generic:
            - generic:
              - link:
                - /url: /
                - img
                - generic: Dashboard
          - generic:
            - generic: Sales
            - generic:
              - generic:
                - button:
                  - img
                  - generic: Leads
                  - img
              - generic:
                - button:
                  - img
                  - generic: Contacts
                  - img
              - generic:
                - button:
                  - img
                  - generic: Accounts
                  - img
              - generic:
                - button:
                  - img
                  - generic: Deals
                  - img
          - generic:
            - generic: Sales Documents
            - generic:
              - link:
                - /url: /quotes
                - img
                - generic: Quotes
              - link:
                - /url: /orders
                - img
                - generic: Orders
              - link:
                - /url: /invoices
                - img
                - generic: Invoices
              - link:
                - /url: /payments
                - img
                - generic: Payments
          - generic:
            - generic: Catalog
            - generic:
              - generic:
                - button:
                  - img
                  - generic: Products
                  - img
          - generic:
            - generic: Communication
            - generic:
              - link:
                - /url: /emails
                - img
                - generic: Emails
          - generic:
            - generic: Productivity
            - generic:
              - link:
                - /url: /calendar
                - img
                - generic: Calendar
              - link:
                - /url: /activities
                - img
                - generic: Activities
          - generic:
            - generic: Analytics
            - generic:
              - link:
                - /url: /reports
                - img
                - generic: Reports
              - link:
                - /url: /automations
                - img
                - generic: Automations
          - generic:
            - generic: Admin
            - generic:
              - link:
                - /url: /team
                - img
                - generic: Team
              - link:
                - /url: /settings/audit-logs
                - img
                - generic: Audit Logs
              - link:
                - /url: /settings/notifications
                - img
                - generic: Notifications
              - link:
                - /url: /settings
                - img
                - generic: Settings
        - button:
          - img
      - generic:
        - banner:
          - generic:
            - navigation:
              - generic:
                - link:
                  - /url: /
                  - img
              - generic:
                - img
                - generic: Leads
          - generic:
            - generic:
              - img
              - textbox:
                - /placeholder: Search...
            - button:
              - img
            - button:
              - img
              - text: New
            - button:
              - img
        - main:
          - generic:
            - generic:
              - generic:
                - generic:
                  - heading [level=3]: Total Leads
                - generic:
                  - generic: "0"
              - generic:
                - generic:
                  - heading [level=3]: New Leads
                - generic:
                  - generic: "0"
                  - paragraph: Awaiting outreach
              - generic:
                - generic:
                  - heading [level=3]: Hot Leads
                - generic:
                  - generic: "0"
                  - paragraph: High priority
              - generic:
                - generic:
                  - heading [level=3]: Conversion Rate
                - generic:
                  - generic: 0%
                  - paragraph: Qualified / Total
              - generic:
                - generic:
                  - heading [level=3]: Pipeline Value
                - generic:
                  - generic: $0
                  - paragraph:
                    - img
                    - text: Active opportunities
            - generic:
              - generic:
                - combobox:
                  - generic: All Scores
                  - img
                - combobox:
                  - generic: All Sources
                  - img
                - button:
                  - img
                  - text: Filter
              - generic:
                - generic:
                  - button:
                    - img
                  - button:
                    - img
                - button:
                  - img
                  - text: Export
                - button [active]:
                  - img
                  - text: Add Lead
            - generic:
              - generic:
                - table:
                  - rowgroup:
                    - row:
                      - columnheader:
                        - checkbox
                      - columnheader: Lead
                      - columnheader: Company
                      - columnheader: Score
                      - columnheader: Stage
                      - columnheader: Source
                      - columnheader: Value
                      - columnheader: Last Activity
                      - columnheader: Actions
                  - rowgroup:
                    - row:
                      - cell: No leads found
              - generic:
                - generic: Showing 0 of 0 leads
                - generic:
                  - button [disabled]: Previous
                  - generic: Page 1 of 1
                  - button [disabled]: Next
  - generic: "0"
  - dialog "Add New Lead" [ref=e2]:
    - generic [ref=e3]:
      - heading "Add New Lead" [level=2] [ref=e4]
      - paragraph [ref=e5]: Fill in the details to create a new lead.
    - generic [ref=e6]:
      - generic [ref=e7]: Basic Info
      - generic [ref=e8]:
        - generic [ref=e9]: Name *
        - textbox "John Doe" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]: Email *
        - textbox "john@company.com" [ref=e13]
      - generic [ref=e14]:
        - text: Phone
        - textbox "+1 (555) 000-0000" [ref=e15]
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: Company *
          - generic [ref=e19]:
            - button "New Company" [ref=e20] [cursor=pointer]:
              - img
            - button "Existing Account" [ref=e21] [cursor=pointer]:
              - img
        - textbox "Acme Corp" [ref=e22]
      - generic [ref=e23]:
        - text: Title
        - textbox "VP of Engineering" [ref=e24]
      - generic [ref=e25]:
        - text: Stage
        - combobox [ref=e26] [cursor=pointer]:
          - img [ref=e27]
      - generic [ref=e29]: Sales Data
      - generic [ref=e30]:
        - text: Source
        - combobox [ref=e31] [cursor=pointer]:
          - img [ref=e32]
      - generic [ref=e34]:
        - text: Est. Value
        - spinbutton [ref=e35]
      - generic [ref=e36]:
        - text: Lead Score
        - combobox [ref=e37] [cursor=pointer]:
          - img [ref=e38]
      - generic [ref=e40]:
        - text: Priority
        - combobox [ref=e41] [cursor=pointer]:
          - img [ref=e42]
      - generic [ref=e44]:
        - text: Qualification
        - combobox [ref=e45] [cursor=pointer]:
          - img [ref=e46]
      - generic [ref=e48]: Organization
      - generic [ref=e49]:
        - text: Location
        - textbox "San Francisco, CA" [ref=e50]
      - generic [ref=e51]:
        - text: Industry
        - textbox "Technology" [ref=e52]
      - generic [ref=e53]:
        - text: Website
        - textbox "https://company.com" [ref=e54]
      - generic [ref=e55]:
        - text: Tags
        - textbox "enterprise, hot-lead" [ref=e56]
      - generic [ref=e57]: Follow-up
      - generic [ref=e58]:
        - text: Next Follow-up Date
        - textbox [ref=e59]
      - generic [ref=e60]:
        - text: Notes
        - textbox "Any additional context..." [ref=e61]
    - generic [ref=e62]:
      - button "Cancel" [ref=e63] [cursor=pointer]
      - button "Create Lead" [ref=e64] [cursor=pointer]:
        - img
        - text: Create Lead
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('CRM Workflow: Leads to Deals & Activities', () => {
  4  |   const testLeadName = `Test Lead ${Math.floor(Math.random() * 10000)}`;
  5  |   const testCompanyName = `Test Company ${Math.floor(Math.random() * 10000)}`;
  6  |   const testActivitySubject = `Product Demo ${Math.floor(Math.random() * 10000)}`;
  7  | 
  8  |   test.beforeEach(async ({ page }) => {
  9  |     // Go to login page and login
  10 |     await page.goto('/login');
  11 |     // Assuming there's a login form
  12 |     if (page.url().includes('login')) {
  13 |         await page.fill('#email', 'admin@nexus.com');
  14 |         await page.fill('#password', 'admin123');
  15 |         await page.click('button[type="submit"]');
  16 |     }
  17 |     // Wait for redirect to dashboard
  18 |     await page.waitForURL('/', { timeout: 10000 });
  19 |     await expect(page).toHaveURL('/');
  20 |   });
  21 | 
  22 |   test('Complete Workflow: Create Lead -> Create Activity -> Convert to Deal', async ({ page }) => {
  23 |     // 1. Create Lead
  24 |     await page.click('a[href="/leads"]');
  25 |     await page.click('button:has-text("Add Lead")'); // Corrected from "New Lead"
> 26 |     await page.fill('input[id="name"]', testLeadName); // Using id based on Lead.tsx
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  27 |     await page.fill('input[id="email"]', 'test@example.com');
  28 |     await page.fill('input[id="company"]', testCompanyName);
  29 |     await page.click('button:has-text("Create Lead")');
  30 |     
  31 |     // Verify toast or list update
  32 |     await expect(page.locator('body')).toContainText('Lead created successfully');
  33 | 
  34 |     // 2. Create Activity for the new Lead
  35 |     await page.click('a[href="/activities"]');
  36 |     await page.click('button:has-text("New Activity")');
  37 |     await page.fill('#subject', testActivitySubject);
  38 |     
  39 |     // Select Lead as entity type
  40 |     await page.click('button:has-text("Lead")'); // The SelectTrigger
  41 |     
  42 |     // Search for the lead in the DynamicAutoSelect
  43 |     await page.click('button:has-text("Select lead...")');
  44 |     await page.fill('input[placeholder*="Search"]', testLeadName);
  45 |     // DynamicAutoSelect labels are ${l.firstName} ${l.lastName}, but for Name it's likely just the string
  46 |     await page.click(`text=${testLeadName}`); 
  47 |     
  48 |     await page.click('button:has-text("Create Activity")');
  49 |     await expect(page.locator('body')).toContainText('Activity created successfully');
  50 | 
  51 |     // 3. Convert Lead to Deal
  52 |     await page.click('a[href="/leads"]');
  53 |     // The search input might be commented out in Leads.tsx (lines 868-876), 
  54 |     // but the lead should be visible if it was just created (Likely first in table)
  55 |     await page.click(`text=${testLeadName}`);
  56 |     
  57 |     // Open convert dialog
  58 |     await page.click('button:has-text("Convert to Contact")'); // The button text in detail footer
  59 |     
  60 |     // Select convert type to Deal in the convert dialog
  61 |     await page.click('button:has-text("Convert to Contact + Account")'); // Open dropdown
  62 |     await page.click('text="Convert to Deal Only"');
  63 |     
  64 |     await page.click('button:has-text("Convert")');
  65 |     
  66 |     await expect(page.locator('body')).toContainText('Lead converted to Deal');
  67 | 
  68 |     // 4. Verify Deal Exists
  69 |     await page.click('a[href="/deals"]');
  70 |     await expect(page.locator('body')).toContainText(testLeadName);
  71 | 
  72 |     // 5. Verify Activity Status
  73 |     await page.click('a[href="/activities"]');
  74 |     await expect(page.locator('body')).toContainText(testActivitySubject);
  75 |     
  76 |     // Mark activity as complete
  77 |     const activityRow = page.locator('tr', { hasText: testActivitySubject });
  78 |     await activityRow.locator('button >> svg.lucide-circle').click();
  79 |     await expect(page.locator('body')).toContainText('Activity marked as complete');
  80 |   });
  81 | });
  82 | 
```