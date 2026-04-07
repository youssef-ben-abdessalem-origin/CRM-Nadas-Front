import { test, expect } from '@playwright/test';

test.describe('CRM Workflow: Leads to Deals & Activities', () => {
  const testLeadName = `Test Lead ${Math.floor(Math.random() * 10000)}`;
  const testCompanyName = `Test Company ${Math.floor(Math.random() * 10000)}`;
  const testActivitySubject = `Product Demo ${Math.floor(Math.random() * 10000)}`;

  test.beforeEach(async ({ page }) => {
    // Go to login page and login
    await page.goto('/login');
    // Assuming there's a login form
    if (page.url().includes('login')) {
        await page.fill('#email', 'admin@nexus.com');
        await page.fill('#password', 'admin123');
        await page.click('button[type="submit"]');
    }
    // Wait for redirect to dashboard
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('Complete Workflow: Create Lead -> Create Activity -> Convert to Deal', async ({ page }) => {
    // 1. Create Lead
    await page.click('a[href="/leads"]');
    await page.click('button:has-text("Add Lead")'); // Corrected from "New Lead"
    await page.fill('input[id="name"]', testLeadName); // Using id based on Lead.tsx
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="company"]', testCompanyName);
    await page.click('button:has-text("Create Lead")');
    
    // Verify toast or list update
    await expect(page.locator('body')).toContainText('Lead created successfully');

    // 2. Create Activity for the new Lead
    await page.click('a[href="/activities"]');
    await page.click('button:has-text("New Activity")');
    await page.fill('#subject', testActivitySubject);
    
    // Select Lead as entity type
    await page.click('button:has-text("Lead")'); // The SelectTrigger
    
    // Search for the lead in the DynamicAutoSelect
    await page.click('button:has-text("Select lead...")');
    await page.fill('input[placeholder*="Search"]', testLeadName);
    // DynamicAutoSelect labels are ${l.firstName} ${l.lastName}, but for Name it's likely just the string
    await page.click(`text=${testLeadName}`); 
    
    await page.click('button:has-text("Create Activity")');
    await expect(page.locator('body')).toContainText('Activity created successfully');

    // 3. Convert Lead to Deal
    await page.click('a[href="/leads"]');
    // The search input might be commented out in Leads.tsx (lines 868-876), 
    // but the lead should be visible if it was just created (Likely first in table)
    await page.click(`text=${testLeadName}`);
    
    // Open convert dialog
    await page.click('button:has-text("Convert to Contact")'); // The button text in detail footer
    
    // Select convert type to Deal in the convert dialog
    await page.click('button:has-text("Convert to Contact + Account")'); // Open dropdown
    await page.click('text="Convert to Deal Only"');
    
    await page.click('button:has-text("Convert")');
    
    await expect(page.locator('body')).toContainText('Lead converted to Deal');

    // 4. Verify Deal Exists
    await page.click('a[href="/deals"]');
    await expect(page.locator('body')).toContainText(testLeadName);

    // 5. Verify Activity Status
    await page.click('a[href="/activities"]');
    await expect(page.locator('body')).toContainText(testActivitySubject);
    
    // Mark activity as complete
    const activityRow = page.locator('tr', { hasText: testActivitySubject });
    await activityRow.locator('button >> svg.lucide-circle').click();
    await expect(page.locator('body')).toContainText('Activity marked as complete');
  });
});
